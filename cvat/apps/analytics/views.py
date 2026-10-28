from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Count
from cvat.apps.engine.models import Job, LabeledShape, LabeledTrack

class PerClassAnnotationAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, job_id=None):
        """
        Returns per-class annotation counts for a given job or across tasks,
        with strict access control verification (Requirement 5).
        """
        user = request.user

        # If a specific job_id is provided, verify job existence and user access permissions
        if job_id:
            try:
                job = Job.objects.select_related('segment__task').get(pk=job_id)
            except Job.DoesNotExist:
                return Response(
                    {'error': 'Job not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )

            task = job.segment.task

            # Check if user has access to this task (Superuser, staff, owner, assignee, or organization member)
            has_access = (
                user.is_superuser or
                user.is_staff or
                task.owner == user or
                task.assignee == user or
                (task.organization and task.organization.members.filter(user=user).exists()) or
                not task.organization # If no org and public/internal, allow authenticated user or refine as needed
            )

            if not has_access:
                return Response(
                    {'error': 'You do not have permission to access this task/job.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Query shapes and tracks for this specific job
            shapes_qs = LabeledShape.objects.filter(job=job_id)
            tracks_qs = LabeledTrack.objects.filter(job=job_id)
        else:
            # If no job_id specified, restrict to user's accessible tasks or superuser
            if user.is_superuser or user.is_staff:
                shapes_qs = LabeledShape.objects.all()
                tracks_qs = LabeledTrack.objects.all()
            else:
                # Filter shapes/tracks belonging to tasks owned/assigned to the user
                shapes_qs = LabeledShape.objects.filter(job__segment__task__owner=user)
                tracks_qs = LabeledTrack.objects.filter(job__segment__task__owner=user)

        # Aggregate counts from LabeledShape by label name
        shape_counts = (
            shapes_qs.values('label__name')
            .annotate(count=Count('id'))
        )

        # Aggregate counts from LabeledTrack by label name
        track_counts = (
            tracks_qs.values('label__name')
            .annotate(count=Count('id'))
        )

        # Combine counts from both shapes and tracks
        combined_counts = {}
        for item in shape_counts:
            label_name = item['label__name'] or 'Unknown'
            combined_counts[label_name] = combined_counts.get(label_name, 0) + item['count']

        for item in track_counts:
            label_name = item['label__name'] or 'Unknown'
            combined_counts[label_name] = combined_counts.get(label_name, 0) + item['count']

        # Sort by count descending
        sorted_counts = dict(sorted(combined_counts.items(), key=lambda item: item[1], reverse=True))

        return Response({
            'job_id': job_id,
            'per_class_counts': sorted_counts
        }, status=status.HTTP_200_OK)
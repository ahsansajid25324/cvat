from django.urls import path
from .views import PerClassAnnotationAnalyticsView

urlpatterns = [
    path('api/analytics/per-class/', PerClassAnnotationAnalyticsView.as_view(), name='per-class-analytics-general'),
    path('api/analytics/per-class/<int:job_id>/', PerClassAnnotationAnalyticsView.as_view(), name='per-class-analytics-job'),
]
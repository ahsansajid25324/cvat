from django.urls import path
from .views import PerClassAnnotationAnalyticsView

urlpatterns = [
    path('per-class/', PerClassAnnotationAnalyticsView.as_view(), name='per-class-analytics-general'),
    path('per-class/<int:job_id>/', PerClassAnnotationAnalyticsView.as_view(), name='per-class-analytics-job'),
]
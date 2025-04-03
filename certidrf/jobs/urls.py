from django.urls import path
from .views import create_job, list_jobs, retrieve_job, apply_for_job, list_applications, list_applied_jobs

urlpatterns = [
    path("create/", create_job, name="create_job"),
    path("", list_jobs, name="list_jobs"),
    path("<int:job_id>/", retrieve_job, name="retrieve_job"),
    path("<int:job_id>/apply/", apply_for_job, name="apply_for_job"),
    path("<int:job_id>/applications/", list_applications, name="list_applications"),
    path('applied-jobs/', list_applied_jobs, name='list_applied_jobs'),
]

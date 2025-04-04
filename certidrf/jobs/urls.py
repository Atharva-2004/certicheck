from django.urls import path
from .views import *

urlpatterns = [
    path("create/", create_job, name="create_job"),
    path("", list_jobs, name="list_jobs"),
    path("list-created-jobs", list_created_jobs_by_recruiter, name="list_jobs"),
    path("<int:job_id>/", retrieve_job, name="retrieve_job"),
    path("<int:job_id>/apply/", apply_for_job, name="apply_for_job"),
    path("<int:job_id>/applications/", list_applications, name="list_applications"),
    path('applied-jobs/', list_applied_jobs, name='list_applied_jobs'),
]

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Job(models.Model):
    recruiter = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255)
    required_documents = models.JSONField(default=dict)  # Defines required documents & fields
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class JobApplication(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    applicant = models.ForeignKey(User, on_delete=models.CASCADE)

    # Aadhaar Card Fields
    aadhaar_number = models.CharField(max_length=14, blank=True, null=True)
    aadhaar_name = models.CharField(max_length=255, blank=True, null=True)
    aadhaar_dob = models.CharField(max_length=10, blank=True, null=True)
    aadhaar_address = models.TextField(blank=True, null=True)
    aadhaar_mobile = models.CharField(max_length=10, blank=True, null=True)
    aadhaar_image_url = models.URLField(blank=True, null=True)

    # PAN Card Fields
    pan_number = models.CharField(max_length=10, blank=True, null=True)
    pan_name = models.CharField(max_length=255, blank=True, null=True)
    pan_dob = models.CharField(max_length=10, blank=True, null=True)
    pan_father_name = models.CharField(max_length=255, blank=True, null=True)
    pan_image_url = models.URLField(blank=True, null=True)

    # 10th Marksheet Fields
    marks_10th_name = models.CharField(max_length=255, blank=True, null=True)
    marks_10th_roll_number = models.CharField(max_length=20, blank=True, null=True)
    marks_10th_percentage = models.CharField(max_length=10, blank=True, null=True)
    marks_10th_board = models.CharField(max_length=255, blank=True, null=True)
    marks_10th_image_url = models.URLField(blank=True, null=True)

    # 12th Marksheet Fields
    marks_12th_name = models.CharField(max_length=255, blank=True, null=True)
    marks_12th_roll_number = models.CharField(max_length=20, blank=True, null=True)
    marks_12th_percentage = models.CharField(max_length=10, blank=True, null=True)
    marks_12th_board = models.CharField(max_length=255, blank=True, null=True)
    marks_12th_image_url = models.URLField(blank=True, null=True)

    # GATE Scorecard Fields
    gate_name = models.CharField(max_length=255, blank=True, null=True)
    gate_reg_number = models.CharField(max_length=20, blank=True, null=True)
    gate_score = models.CharField(max_length=10, blank=True, null=True)
    gate_air = models.CharField(max_length=10, blank=True, null=True)
    gate_image_url = models.URLField(blank=True, null=True)

    # Resume Fields
    resume_name = models.CharField(max_length=255, blank=True, null=True)
    resume_contact_info = models.CharField(max_length=20, blank=True, null=True)
    resume_experience = models.CharField(max_length=20, blank=True, null=True)
    resume_skills = models.TextField(blank=True, null=True)
    resume_url = models.URLField(blank=True, null=True)

    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.applicant.username} applied for {self.job.title}"

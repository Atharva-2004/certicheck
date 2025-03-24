from django.db import models
from django.contrib.auth.hashers import check_password, make_password


class User(models.Model):
    username = models.CharField(max_length=60, unique=True)
    email = models.EmailField(unique=True)  
    password = models.CharField(max_length=255)   
    role = models.CharField(max_length=10, choices=[('applicant', 'Applicant'), ('recruiter', 'Recruiter')])
    createdAt = models.DateField(auto_now_add=True)

    REQUIRED_FIELDS = ['username', 'email', 'password', 'role']


    def save(self, *args, **kwargs):
        """Ensure password is always hashed before saving"""
        if not self.password.startswith('pbkdf2_sha256$'):  # Avoid double hashing
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def check_password(self, raw_password):
        """Validate password"""
        return check_password(raw_password, self.password)
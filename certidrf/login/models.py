from django.db import models
from django.contrib.auth.hashers import check_password, make_password
from django.core.validators import RegexValidator

class User(models.Model):
    firstname = models.CharField(max_length=60)
    middlename = models.CharField(max_length=60)
    lastname = models.CharField(max_length=60)
    username = models.CharField(max_length=60, unique=True)
    email = models.EmailField(unique=True)  
    password = models.CharField(max_length=255)   
    gender = models.CharField(max_length=60)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'"
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    role = models.CharField(max_length=10, choices=[('applicant', 'Applicant'), ('recruiter', 'Recruiter')])
    organization = models.CharField(max_length=100, blank=True, null=True)
    organization_email = models.EmailField(blank=True, null=True)
    createdAt = models.DateField(auto_now_add=True)

    REQUIRED_FIELDS = ['firstname','lastname','username', 'email', 'password', 'role', 'phone_number']


    def save(self, *args, **kwargs):
        """Ensure password is always hashed before saving"""
        if not self.password.startswith('pbkdf2_sha256$'):  # Avoid double hashing
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def check_password(self, raw_password):
        """Validate password"""
        return check_password(raw_password, self.password)
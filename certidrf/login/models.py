from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.validators import RegexValidator

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError('The Email field is required.')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)  # Hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser):  # Inherit from AbstractBaseUser
    firstname = models.CharField(max_length=60)
    middlename = models.CharField(max_length=60, blank=True, null=True)
    lastname = models.CharField(max_length=60)
    username = models.CharField(max_length=60, unique=True)
    email = models.EmailField(unique=True)
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
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['firstname', 'lastname', 'email', 'phone_number', 'role']

    objects = UserManager()  # Custom Manager

    def __str__(self):
        return self.username

from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (("EMPLOYEE", "Employee"), ("MANAGER", "Manager"))
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

class Task(models.Model):
    STATUS_CHOICES = (("PENDING", "Pending"), ("APPROVED", "Approved"), ("REJECTED", "Rejected"))

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=100)
    description = models.TextField()
    hours_spent = models.FloatField()
    tags = models.CharField(max_length=100)
    task_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    rejection_comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

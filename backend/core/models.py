from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    hours_spent = models.DecimalField(max_digits=4, decimal_places=2)
    date = models.DateField()
    tags = models.CharField(max_length=100)
    status = models.CharField(choices=STATUS_CHOICES, default='pending', max_length=10)
    manager_comments = models.TextField(blank=True, null=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} - {self.employee.username}"


class EmployeeProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employeeprofile')
    is_employee = models.BooleanField(default=False)
    is_manager = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username
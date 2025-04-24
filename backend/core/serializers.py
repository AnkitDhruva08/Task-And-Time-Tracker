# serializers.py

from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'employee', 'title', 'description', 'hours_spent', 'date', 'tags', 'status', 'manager_comments']

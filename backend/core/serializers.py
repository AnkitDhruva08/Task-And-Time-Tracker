from rest_framework import serializers
from .models import Task, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class TaskSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['status', 'user', 'rejection_comment']

    def validate(self, data):
        user = self.context['request'].user
        task_date = data.get('task_date')
        hours_spent = data.get('hours_spent', 0)

        total_hours = Task.objects.filter(
            user=user,
            task_date=task_date
        ).exclude(id=self.instance.id if self.instance else None).aggregate(
            models.Sum('hours_spent')
        )['hours_spent__sum'] or 0

        if total_hours + hours_spent > 8:
            raise serializers.ValidationError("Total logged hours exceed 8 hours for this day.")
        return data

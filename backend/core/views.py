from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsOwnerOrManager

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrManager]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'MANAGER':
            return Task.objects.all()
        return Task.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        if task.status == "APPROVED":
            return Response({"detail": "Approved task cannot be edited."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

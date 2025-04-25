from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.models import Task
from core.serializers import TaskSerializer
from django.db import models 
from django.db.models import F
from django.shortcuts import get_object_or_404



class TaskCreateView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        data = request.data
        print('data ==<<<>>', data)
        data['employee'] = request.user.id  

        # Task Validation: Ensure total hours don't exceed 8 hours per day
        total_hours = Task.objects.filter(employee=request.user, date=data['date']).aggregate(models.Sum('hours_spent'))['hours_spent__sum'] or 0
        if total_hours + float(data['hours_spent']) > 8:  
            return Response({'error': 'You cannot log more than 8 hours per day.'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = TaskSerializer(data=data)
        print('serializer ===<<>>', serializer)
        print('serializer.is_valid() ==<<<>>', serializer.is_valid())
        if serializer.is_valid():
            serializer.save()  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskListView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        print('request.user ==<<<>>', request.user.id)
        is_manager = request.user.employeeprofile.is_manager
        print('is_manager ==<<<>>', is_manager)
        is_employee = request.user.employeeprofile.is_employee
        print('is_employee ==<<<>>', is_employee)

        if is_manager:
            # For managers, filter tasks to include only active tasks
            tasks = Task.objects.select_related('employee').filter(active=True).annotate(
                username=F('employee__username')
            ).values(
               'id', 'username', 'title', 'description', 'date', 'hours_spent', 'tags', 'manager_comments', 'status'
            )
            print('tasks ==<<<>>', tasks)
            return Response(tasks)

        # For employees, filter tasks to include only active tasks
        tasks = Task.objects.filter(employee=request.user, active=True)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    

    def patch(self, request, pk):
        try:
            print('pk ==<<<>>', pk)
            print('request.data ==<<<>>', request.data)

            task = get_object_or_404(Task, id=pk)
            print('task ==<<<>>', task)

            user = request.user
            print('user ==<<<>>', user)

            # Get the EmployeeProfile associated with the user
            employee_profile = getattr(user, 'employeeprofile', None)

            data = request.data.copy()

            # Check user role and modify data accordingly
            if employee_profile and employee_profile.is_employee:
                print('User  is an employee, updating task status to pending.')
                data['status'] = 'pending'
                data['manager_comments'] = ''  # Make comment empty

            serializer = TaskSerializer(task, data=data, partial=True)
            print('serializer ===<<>>', serializer)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)

            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Task.DoesNotExist:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

        

    def delete( self, request, pk):
        try:
            task = Task.objects.get(id=pk)
            task.active = False 
            task.save() 
            return Response({'message': 'Task Deleted successfully.'}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)



class TaskApprovalView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id, employee__manager=request.user)
            print('task ==<<<>>', task)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found or you are not authorized to manage this task.'}, status=status.HTTP_404_NOT_FOUND)
        
        status = request.data.get('status')
        manager_comments = request.data.get('manager_comments')

        if status not in ['approved', 'rejected']:
            return Response({'error': 'Invalid status. Must be either "approved" or "rejected".'}, status=status.HTTP_400_BAD_REQUEST)

        if status == 'rejected' and not manager_comments:
            return Response({'error': 'Please provide comments when rejecting a task.'}, status=status.HTTP_400_BAD_REQUEST)

        # Update task status and comments
        task.status = status
        task.manager_comments = manager_comments
        task.save()

        return Response(TaskSerializer(task).data)

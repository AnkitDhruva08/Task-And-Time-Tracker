from django.urls import path, include
from rest_framework.routers import DefaultRouter 
from core.views.auth_views import RegisterViews, LoginView, DashboardView
from core.views.task_views import TaskCreateView, TaskListView, TaskApprovalView

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    # login
    path('login/', LoginView.as_view(), name='login'),

    # Custom endpoints
    path('register/', RegisterViews.as_view(), name='register'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),

    path('tasks/', TaskCreateView.as_view(), name='task-create'),  
    path('tasks/list/', TaskListView.as_view(), name='task-list'), 
    path('tasks/<int:pk>/', TaskListView.as_view(), name='task-list'), 
    path('tasks/<int:task_id>/approve/', TaskApprovalView.as_view(), name='task-approve'), 


]
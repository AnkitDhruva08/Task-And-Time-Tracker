from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from core.models import EmployeeProfile, User
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import authenticate, login

# User = get_user_model()
class RegisterViews(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        print('data ==<<<>>', data)

        password = data.pop('password', None)

        if not password:
            return Response({"error": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            email = data.get('email')
            manager_name = data.get('manager_name')
            employee_name = data.get('employee_name')

            if not (manager_name or employee_name):
                return Response({"error": "Either 'manager_name' or 'employee_name' is required."}, status=status.HTTP_400_BAD_REQUEST)

            username = manager_name if manager_name else employee_name

            # Create the user
            user = User.objects.create(
                username=username,
                email=email,
                password=make_password(password),
            )
            print('user ==<<<>>', user)

            # Determine role
            is_manager = bool(manager_name)
            is_employee = bool(employee_name)

            # Create the profile with appropriate role
            profile = EmployeeProfile.objects.create(
                user=user,
                is_manager=is_manager,
                is_employee=is_employee
            )
            print('profile ==<<<>>', profile)

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Registered Successfully',
                'status': 200,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_manager': profile.is_manager,
                    'is_employee': profile.is_employee
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print('error ==<<<>>', str(e))
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)




#  Login views Based on role and also for organization
class LoginView(APIView):
    """
    Handle login for companies using email and password.
    Returns JWT token and role-based information if credentials are correct.
    """
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        print('data ==<<<>>', request.data)
        
        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the user based on the email
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid email or user does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Authenticate the user
        user = authenticate(request, username=user.username, password=password)
        
        if user is not None:
            # Log the user in and create a session
            login(request, user)

            # Get the employee profile (which holds the role info)
            profile = EmployeeProfile.objects.get(user=user)

            # Check user role (Manager or Employee)
            is_manager = profile.is_manager
            is_employee = profile.is_employee

            # Create JWT tokens for the user
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Return the response based on the role
            return Response({
                "message": "Login successful!",
                "status": 200,
                "role": "manager" if is_manager else "employee", 
                "tokens": {
                    "access": access_token,
                    "refresh": str(refresh)
                },
                "session": "User session created successfully"
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid password"}, status=status.HTTP_401_UNAUTHORIZED)
        




class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch user's details
        user = request.user
        profile = EmployeeProfile.objects.get(user=user)

        # Check user role (Manager or Employee)
        is_manager = profile.is_manager
        is_employee = profile.is_employee

        # Return the dashboard data based on the role
        if is_manager:
            # Manager dashboard data
            return Response({
                "message": "Manager dashboard data",
                "status": 200,
                "data": {
                    "manager_name": user.username,
                    "email": user.email,
                    "is_manager": is_manager,
                    "is_employee": is_employee
                }
            }, status=status.HTTP_200_OK)
        elif is_employee:
            # Employee dashboard data
            return Response({
                "message": "Employee dashboard data",
                "status": 200,
                "data": {
                    "employee_name": user.username,
                    "email": user.email,
                    "is_manager": is_manager,
                    "is_employee": is_employee
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid role"}, status=status.HTTP_403_FORBIDDEN)
        

      
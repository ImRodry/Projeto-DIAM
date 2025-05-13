from django.urls import path
from . import views

app_name = "database"

urlpatterns = [
    path("api/signup/", views.SignupView.as_view()),
    path("api/login/", views.LoginView.as_view()),
    path("api/logout/", views.LogoutView.as_view()),
    path("api/user/", views.UserView.as_view()),
]

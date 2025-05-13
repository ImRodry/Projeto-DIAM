from django.urls import path
from . import views

app_name = "database"

urlpatterns = [
    path("api/signup/", views.signup),
    path("api/login/", views.login_view),
    path("api/logout/", views.logout_view),
    path("api/user/", views.user_view),
]

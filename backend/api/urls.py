from django.urls import path
from . import views

app_name = "api"

urlpatterns = [
    path("signup/", views.SignupView.as_view()),
    path("login/", views.LoginView.as_view()),
    path("logout/", views.LogoutView.as_view()),
    path("user/", views.UserView.as_view()),
    path("events/", views.EventMultipleView.as_view()),
    path("events/<int:pk>/", views.EventSingleView.as_view()),
    path("purchase/<int:pk>/", views.PurchaseSingleView.as_view()),
    path("purchases/", views.PurchasesView.as_view()),
    path("upload/", views.UploadImageView.as_view()),
]

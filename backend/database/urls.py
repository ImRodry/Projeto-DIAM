from django.urls import path
from . import views

app_name = "database"

urlpatterns = [
    path("api/signup/", views.SignupView.as_view()),
    path("api/login/", views.LoginView.as_view()),
    path("api/logout/", views.LogoutView.as_view()),
    path("api/user/", views.UserView.as_view()),
    path("api/events/", views.EventMultipleView.as_view()),
    path("api/events/<int:pk>/", views.EventSingleView.as_view()),
    path("api/events/<int:pk>/ticket-types/", views.TicketTypeMultipleView.as_view()),
    path(
        "api/events/<int:pk>/ticket-types/<int:ticket_type_pk>/",
        views.TicketTypeSingleView.as_view(),
    ),
    path("api/purchases/", views.PurchasesView.as_view()),
]

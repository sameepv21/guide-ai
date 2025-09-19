from django.urls import path
from users.views import (
    signup_view,
    login_view,
    logout_view,
    profile_view,
    request_password_change,
    verify_and_change_password,
)

urlpatterns = [
    path("signup/", signup_view, name="signup"),
    path("login/", login_view, name="login"),
    path("logout/", logout_view, name="logout"),
    path("profile/", profile_view, name="profile"),
    path(
        "request-password-change/",
        request_password_change,
        name="request_password_change",
    ),
    path("change-password/", verify_and_change_password, name="change_password"),
]

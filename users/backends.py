from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = kwargs.get('email', username)
        if email is None:
            return None
        
        email = email.lower()
        User = get_user_model()
        user = User.objects.filter(email__iexact=email).first()
        
        if user and user.check_password(password):
            return user
        return None

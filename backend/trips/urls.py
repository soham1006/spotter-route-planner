from django.urls import path
from .views import health_check, plan_trip

urlpatterns = [
    path("health/", health_check),
    path("trips/plan/", plan_trip),
]
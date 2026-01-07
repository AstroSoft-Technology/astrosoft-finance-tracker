from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, IncomeViewSet, ExpenseViewSet, LiabilityViewSet
from .views import (
    UserViewSet, IncomeViewSet, ExpenseViewSet, LiabilityViewSet, DashboardStatsView,
    EmployeeViewSet, SalaryPaymentViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'income', IncomeViewSet, basename='income')
router.register(r'expenses', ExpenseViewSet, basename='expenses')
router.register(r'liabilities', LiabilityViewSet, basename='liabilities')
router.register(r'employees', EmployeeViewSet, basename='employees')
router.register(r'payroll', SalaryPaymentViewSet, basename='payroll')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]

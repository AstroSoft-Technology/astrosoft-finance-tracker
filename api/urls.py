from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, IncomeViewSet, ExpenseViewSet, LiabilityViewSet,
    DashboardStatsView, EmployeeViewSet, SalaryPaymentViewSet,
    CustomerViewSet, CustomerPaymentViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'income', IncomeViewSet, basename='income')
router.register(r'expenses', ExpenseViewSet, basename='expenses')
router.register(r'liabilities', LiabilityViewSet, basename='liabilities')
router.register(r'employees', EmployeeViewSet, basename='employees')
router.register(r'payroll', SalaryPaymentViewSet, basename='payroll')
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'customer-payments', CustomerPaymentViewSet,
                basename='customer-payment')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]

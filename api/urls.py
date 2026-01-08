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
    # Router handles all the /api/income, /api/expenses, etc.
    path('', include(router.urls)),

    # This creates the link: /api/stats/
    # The frontend is specifically asking for "stats", so we must name it "stats"!
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]

from urllib import request
from django.shortcuts import render
from django.contrib.auth.models import User
from django.db.models import Sum
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from decimal import Decimal
import datetime
from .serializers import (
    UserSerializer, IncomeSerializer, ExpenseSerializer,
    LiabilitySerializer, EmployeeSerializer, SalaryPaymentSerializer
)
from .models import Income, Expense, Liability, Employee, SalaryPayment
from django_filters.rest_framework import DjangoFilterBackend

# --- CRUD ViewSets ---


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Income.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LiabilityViewSet(viewsets.ModelViewSet):
    serializer_class = LiabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Liability.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        liability = self.get_object()

        try:
            amount = Decimal(str(request.data.get('amount', 0)))
        except:
            return Response({'error': 'Invalid amount format'}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({'error': 'Amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)

        if amount > liability.remaining_amount:
            return Response({'error': 'Amount exceeds remaining debt'}, status=status.HTTP_400_BAD_REQUEST)

        # Update Liability
        liability.paid_amount += amount
        if liability.remaining_amount <= Decimal('0.00'):
            liability.is_settled = True
        liability.save()

        # Create Expense Record with 'Liability' Category
        Expense.objects.create(
            user=request.user,
            category='Liability',
            amount=amount,
            date=request.data.get('date', datetime.date.today()),
            description=f"Payment for {liability.title}"
        )

        return Response({'status': 'payment recorded', 'new_balance': liability.remaining_amount})

# --- Dashboard Logic ---


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = datetime.date.today()

        # 1. Totals
        total_income = Income.objects.filter(user=user).aggregate(Sum('amount'))[
            'amount__sum'] or Decimal(0)
        total_expense = Expense.objects.filter(user=user).aggregate(Sum('amount'))[
            'amount__sum'] or Decimal(0)

        liabilities = Liability.objects.filter(user=user)
        # Manual sum for precision
        total_liabilities = sum([l.remaining_amount for l in liabilities])

        balance = total_income - total_expense

        # 2. Recent Transactions
        recent_incomes = Income.objects.filter(user=user).values(
            'id', 'source', 'amount', 'date', 'created_at')
        recent_expenses = Expense.objects.filter(user=user).values(
            'id', 'category', 'amount', 'date', 'created_at')

        transactions = []
        for i in recent_incomes:
            transactions.append({'id': i['id'], 'title': i['source'],
                                'amount': i['amount'], 'date': i['date'], 'type': 'income'})
        for e in recent_expenses:
            transactions.append({'id': e['id'], 'title': e['category'],
                                'amount': e['amount'], 'date': e['date'], 'type': 'expense'})

        transactions.sort(key=lambda x: x['date'], reverse=True)
        recent_transactions = transactions[:5]

        # 3. Pie Chart Data
        category_stats = Expense.objects.filter(user=user).values(
            'category').annotate(total=Sum('amount')).order_by('-total')

        # 4. Bar Chart Data (Last 6 Months)
        monthly_data = []
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) -
                           datetime.timedelta(days=i*30)).replace(day=1)

            # Filter by Year and Month
            inc = Income.objects.filter(
                user=user,
                date__year=month_start.year,
                date__month=month_start.month
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            exp = Expense.objects.filter(
                user=user,
                date__year=month_start.year,
                date__month=month_start.month
            ).aggregate(Sum('amount'))['amount__sum'] or 0

            monthly_data.append({
                "name": month_start.strftime("%b"),  # e.g. "Jan"
                "income": inc,
                "expense": exp
            })

        return Response({
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "total_liabilities": total_liabilities,
            "recent_transactions": recent_transactions,
            "category_stats": category_stats,
            "monthly_stats": monthly_data
        })


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Employee.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Payroll Management ---

class SalaryPaymentViewSet(viewsets.ModelViewSet):
    queryset = SalaryPayment.objects.all()
    serializer_class = SalaryPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    # --- ADDED: Filter Configuration ---
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee']  # Allows ?employee=ID in URL

    def get_queryset(self):
        # Base filter: only show payments related to the logged-in user
        return SalaryPayment.objects.filter(employee__user=self.request.user).order_by('-payment_date')

    def perform_create(self, serializer):
        # 1. Save the Salary Record
        salary_payment = serializer.save()

        # 2. AUTO-CREATE EXPENSE RECORD
        Expense.objects.create(
            user=self.request.user,
            category='Salary',
            amount=serializer.validated_data['amount'],
            date=serializer.validated_data['payment_date'],
            description=f"Salary Payment: {salary_payment.employee.name} ({serializer.validated_data['title']})"
        )

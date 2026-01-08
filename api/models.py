from django.db import models
from django.contrib.auth.models import User
import datetime

# Options for Expense Categories
CATEGORY_CHOICES = [
    ('Food', 'Food'),
    ('Transport', 'Transport'),
    ('Utilities', 'Utilities'),
    ('Entertainment', 'Entertainment'),
    ('Healthcare', 'Healthcare'),
    ('Education', 'Education'),
    ('Housing', 'Housing'),
    ('Salary', 'Salary'),
    ('Liability', 'Debt Repayment'),
    ('Other', 'Other'),
]


class Income(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    source = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source} - {self.amount}"


class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.amount}"


class Liability(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0)
    due_date = models.DateField(null=True, blank=True)
    is_settled = models.BooleanField(default=False)

    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount

    def __str__(self):
        return f"{self.title} ({self.remaining_amount} remaining)"


class Employee(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    email = models.EmailField(blank=True, null=True)
    joined_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name


class SalaryPayment(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateField()
    title = models.CharField(max_length=255, default="Salary Payment")

    def __str__(self):
        return f"{self.employee.name} - {self.title}"


class Customer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    project_name = models.CharField(max_length=200)
    domain_name = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # Financials
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    advance_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    is_payment_confirmed = models.BooleanField(default=False)

    # --- New Field Added Here ---
    is_project_delivered = models.BooleanField(default=False)

    # Dates
    delivery_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.project_name}"


# --- NEW: Partial Payment Model ---
class CustomerPayment(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=datetime.date.today)
    note = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.name} - {self.amount}"

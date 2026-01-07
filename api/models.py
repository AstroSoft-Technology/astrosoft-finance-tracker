from django.db import models
from django.contrib.auth.models import User

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
    source = models.CharField(max_length=255)  # e.g., "Salary", "Freelance"
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
    """
    Tracks debts/loans. 
    When you pay off part of a liability, we will update 'paid_amount'.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)  # e.g., "Car Loan", "Credit Card"
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
    role = models.CharField(max_length=255)  # e.g., "Software Engineer"
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

    # --- UPDATE THIS FUNCTION ---
    def __str__(self):
        # <--- Change .month to .title
        return f"{self.employee.name} - {self.title}"

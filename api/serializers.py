from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Income, Expense, Liability, Employee, SalaryPayment, Customer, CustomerPayment


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = "__all__"
        read_only_fields = ["user"]


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["user"]


class LiabilitySerializer(serializers.ModelSerializer):
    remaining_amount = serializers.ReadOnlyField()

    class Meta:
        model = Liability
        fields = "__all__"
        read_only_fields = ["user"]


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"
        read_only_fields = ["user"]


class SalaryPaymentSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.name')
    employee_role = serializers.ReadOnlyField(source='employee.role')

    class Meta:
        model = SalaryPayment
        fields = "__all__"

# --- NEW: Payment Serializer ---


class CustomerPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerPayment
        fields = '__all__'

# --- UPDATED: Customer Serializer ---


class CustomerSerializer(serializers.ModelSerializer):
    # These fields are calculated on the fly
    total_paid = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def get_total_paid(self, obj):
        # Sum of advance + all partial payments
        payments_sum = sum(p.amount for p in obj.payments.all())
        return obj.advance_amount + payments_sum

    def get_remaining(self, obj):
        paid = self.get_total_paid(obj)
        return obj.total_amount - paid

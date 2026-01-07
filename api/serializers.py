from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Income, Expense, Liability, Employee, SalaryPayment

# User Serializer (for registration/login)


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
        read_only_fields = ["user"]  # User is auto-assigned


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["user"]


class LiabilitySerializer(serializers.ModelSerializer):
    remaining_amount = serializers.ReadOnlyField()  # Calculated field

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

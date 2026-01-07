from django.contrib import admin
from .models import Income, Expense, Liability


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ('source', 'amount', 'date', 'user')
    list_filter = ('date', 'user')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('category', 'amount', 'date', 'user')
    list_filter = ('category', 'date', 'user')


@admin.register(Liability)
class LiabilityAdmin(admin.ModelAdmin):
    list_display = ('title', 'total_amount',
                    'remaining_amount', 'is_settled', 'user')
    list_filter = ('is_settled', 'user')

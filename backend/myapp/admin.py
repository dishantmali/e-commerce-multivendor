from django.contrib import admin
from .models import (
    CustomUser,
    VendorProfile,
    Product,
    Category,
    Order,
    OrderItem,
    Cart,
    CartItem,
    CategoryRequest,
    Offer
)


# ---------------- USER ---------------- #
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    search_fields = ('email', 'name')


# ---------------- VENDOR ---------------- #
@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'shop_name', 'user', 'is_approved')
    list_filter = ('is_approved',)
    search_fields = ('shop_name', 'user__email')


# ---------------- CATEGORY ---------------- #
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'parent')
    search_fields = ('name',)

    def delete_queryset(self, request, queryset):
        """
        Forces the custom delete() logic for every category 
        selected in the admin bulk delete action.
        """
        for category in queryset:
            category.delete()

# ---------------- PRODUCT ---------------- #
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'vendor', 'price', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('name',)

    # 🔥 Quick approve from admin panel
    actions = ['approve_products']

    def approve_products(self, request, queryset):
        queryset.update(status='approved')
    approve_products.short_description = "Approve selected products"


# ---------------- ORDER ITEM ---------------- #
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    # Added the new fields so you can manage them inside the Order view
    fields = ('product', 'vendor', 'quantity', 'price', 'status', 'confirmed_at', 'shipped_at', 'delivered_at')


# ---------------- ORDER ---------------- #
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'total_price',
        # 'status',  <-- REMOVED THIS
        'payment_status',
        'created_at'
    )
    # REMOVED 'status' from list_filter
    list_filter = ('payment_status',) 
    search_fields = ('user__email',)
    inlines = [OrderItemInline]


# ---------------- CART ---------------- #
class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user')
    inlines = [CartItemInline]


# ---------------- CATEGORY REQUEST ---------------- #
@admin.register(CategoryRequest)
class CategoryRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'requested_by', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name',)


# ---------------- OFFER ---------------- #
@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'start_date', 'end_date',
        'requested_by', 'status', 'created_at'
    )
    list_filter = ('status',)
    search_fields = ('title',)

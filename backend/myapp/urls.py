from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    # Auth
    RegisterView, MeView,
    # Products
    ProductListView, ProductDetailView,
    # Vendor
    VendorProductListCreateView, VendorProductUpdateView,
    # Orders
    OrderListView, VendorOrderStatusUpdateView,
    # Payment
    CreateRazorpayOrderView, VerifyPaymentView,
    # Admin
    AdminProductApprovalView, AdminVendorApprovalView,
    AdminPendingProductsView, AdminPendingVendorsView,
    # Category
    CategoryListView,
    # Cart
    CartView, AddToCartView, CheckoutView, RemoveFromCartView,
    # Homepage
    HomePageView,
)

urlpatterns = [

    # ---------------- AUTH ---------------- #
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),

    # ---------------- PRODUCTS ---------------- #
    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product_detail'),

    # ---------------- VENDOR ---------------- #
    path('vendor/products/', VendorProductListCreateView.as_view(), name='vendor_product_list_create'),
    path('vendor/products/<int:pk>/', VendorProductUpdateView.as_view(), name='vendor_product_update'),

    # ---------------- ADMIN ---------------- #
    path('admin/products/pending/', AdminPendingProductsView.as_view(), name='admin_pending_products'),
    path('admin/products/<int:product_id>/action/', AdminProductApprovalView.as_view(), name='admin_product_action'),

    path('admin/vendors/pending/', AdminPendingVendorsView.as_view(), name='admin_pending_vendors'),
    path('admin/vendors/<int:vendor_id>/action/', AdminVendorApprovalView.as_view(), name='admin_vendor_action'),

    # ---------------- CATEGORY ---------------- #
    path('categories/', CategoryListView.as_view(), name='category_list'),

    # ---------------- CART ---------------- #
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='add_to_cart'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('cart/remove/<int:item_id>/', RemoveFromCartView.as_view(), name='remove_from_cart'),

    # ---------------- PAYMENT ---------------- #
    path('payment/create-order/', CreateRazorpayOrderView.as_view(), name='create_razorpay_order'),
    path('payment/verify/', VerifyPaymentView.as_view(), name='verify_payment'),

    # ---------------- ORDERS ---------------- #
    path('orders/', OrderListView.as_view(), name='order_list'),
    path('vendor/orders/<int:pk>/status/', VendorOrderStatusUpdateView.as_view(), name='vendor_order_status_update'),

    # ---------------- HOMEPAGE ---------------- #
    path('homepage/', HomePageView.as_view(), name='homepage'),
]


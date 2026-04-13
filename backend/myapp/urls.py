from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, MeView,
    ProductListView, ProductDetailView,
    VendorProductListCreateView, VendorProductUpdateView,
    OrderListView, VendorOrderStatusUpdateView,
    CreateRazorpayOrderView, VerifyPaymentView,
)

urlpatterns = [
    # Auth APIs
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path(
        'auth/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),

    # Public / Buyer Product APIs
    path('products/', ProductListView.as_view(), name='product_list'),
    path(
        'products/<int:pk>/',
        ProductDetailView.as_view(),
        name='product_detail'),

    # Vendor Product APIs
    path(
        'vendor/products/',
        VendorProductListCreateView.as_view(),
        name='vendor_product_list_create'),
    path('vendor/products/<int:pk>/',
         VendorProductUpdateView.as_view(),
         name='vendor_product_update'),

    # Razorpay Payment APIs
    path(
        'payment/create-order/',
        CreateRazorpayOrderView.as_view(),
        name='create_razorpay_order'),
    path(
        'payment/verify/',
        VerifyPaymentView.as_view(),
        name='verify_payment'),

    # Orders APIs
    # List orders only (creation via payment flow)
    path('orders/', OrderListView.as_view(), name='order_list'),
    path('vendor/orders/<int:pk>/status/',
         VendorOrderStatusUpdateView.as_view(),
         name='vendor_order_status_update'),
]

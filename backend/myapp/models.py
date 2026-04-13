from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('buyer', 'Buyer'),
        ('vendor', 'Vendor'),
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='buyer')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name', 'role']

    def __str__(self):
        return self.email


class VendorProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='vendor_profile')
    shop_name = models.CharField(max_length=255)
    contact_details = models.TextField()

    def __str__(self):
        return self.shop_name


class Product(models.Model):
    vendor = models.ForeignKey(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name='products')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(
        upload_to='product_images/')
    description = models.TextField()

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent_to_factory', 'Sent to Factory'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    # Valid status transitions: vendor can only move forward through the flow
    VALID_TRANSITIONS = {
        'pending': ['sent_to_factory'],
        'sent_to_factory': ['shipped'],
        'shipped': ['delivered'],
        'delivered': [],
    }

    buyer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='orders')
    vendor = models.ForeignKey(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name='orders_received')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    address = models.TextField()
    phone = models.CharField(max_length=20)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending')

    # Razorpay payment fields
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(
        max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(
        max_length=255, blank=True, null=True)
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending')

    # Timestamps for status transitions
    created_at = models.DateTimeField(auto_now_add=True)
    sent_to_factory_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    def can_transition_to(self, new_status):
        """Check if a status transition is valid."""
        return new_status in self.VALID_TRANSITIONS.get(self.status, [])

    def __str__(self):
        return f"Order {self.id} - {self.product.name}"

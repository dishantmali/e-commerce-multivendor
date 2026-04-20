from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.validators import RegexValidator
from django_resized import ResizedImageField

mobile_num_validator = RegexValidator(
    regex=r'^\d{10}$',
    message="Mobile number must be exactly 10 digits."
)

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
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
        related_name='vendor_profile'
    )
    shop_name = models.CharField(max_length=255)
    contact_details = models.TextField()
    logo = models.ImageField(upload_to='vendor_logos/', null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    phone = models.CharField(
        max_length=10, 
        validators=[mobile_num_validator], 
        null=True, 
        blank=True
    )
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.shop_name

class Category(models.Model):
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='category_images/', null=True, blank=True)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='subcategories'
    )

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        # Prevent deletion of the fallback category itself
        if self.name.lower() == "uncategorized":
            return 
        uncategorized, _ = Category.objects.get_or_create(name="Uncategorized")
        self.product_set.all().update(category=uncategorized)
        super().delete(*args, **kwargs)

class Product(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    vendor = models.ForeignKey(
        VendorProfile,
        on_delete=models.CASCADE,
        related_name='products'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = ResizedImageField(
        size=[800, 1000],        # Max width/height
        crop=['middle', 'center'], # Optional: auto-crop to fit ratio
        quality=75,               # Compression level (1-100)
        upload_to='product_images/',
        force_format='JPEG'       # Converts PNGs/WebP to JPEG for better compression
    )
    description = models.TextField()
    
    # FIX #2: Stock management field
    stock_quantity = models.PositiveIntegerField(default=0)

    # FIX #5: auto_now_add ensures field is never None
    created_at = models.DateTimeField(auto_now_add=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True # Added for performance
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        db_index=True # Added for performance
    )
    address = models.TextField()
    phone = models.CharField(
        max_length=10, 
        validators=[mobile_num_validator]
    )
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} - {self.user.email}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    vendor = models.ForeignKey('VendorProfile', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ['order', 'product']

    def __str__(self):
        return f"{self.product.name} (x{self.quantity})"

class Cart(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ['cart', 'product']

class CategoryRequest(models.Model):
    STATUS_CHOICES = (('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'))
    name = models.CharField(max_length=255)
    image = models.ImageField(upload_to='category_request_images/', null=True, blank=True)
    requested_by = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='category_requests')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

class Offer(models.Model):
    STATUS_CHOICES = (('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'))
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='offer_images/')
    start_date = models.DateField()
    end_date = models.DateField(db_index=True)
    requested_by = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name='offer_requests', null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='approved', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Banner(models.Model):
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='banners/')
    is_active = models.BooleanField(default=True)

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey('Product', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product') # Prevent duplicate likes
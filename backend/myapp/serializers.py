from rest_framework import serializers
from .models import (
    CustomUser, VendorProfile, Product, Order, OrderItem,
    Category, Cart, CartItem, CategoryRequest, Offer
)



# ---------------- USER ----------------
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'role']


# ---------------- REGISTER ----------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    shop_name = serializers.CharField(write_only=True, required=False)
    contact_details = serializers.CharField(write_only=True, required=False)
    logo = serializers.ImageField(required=False)
    address = serializers.CharField(required=False)
    phone = serializers.CharField(required=False)

    class Meta:
        model = CustomUser
        fields = [
            'name',
            'email',
            'password',
            'role',
            'shop_name',
            'contact_details',
            'logo',
            'address',
            'phone',
        ]

    def validate(self, data):
        if data.get('role') == 'vendor':
            if not data.get('shop_name') or not data.get('contact_details'):
                raise serializers.ValidationError(
                    "Vendor must provide shop_name and contact_details."
                )
        return data

    def create(self, validated_data):
        role = validated_data.get('role', 'buyer')

        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=role,
            username=validated_data['email']
        )

        if role == 'vendor':
            VendorProfile.objects.create(
                user=user,
                shop_name=validated_data.get('shop_name'),
                contact_details=validated_data.get('contact_details'),
                logo=validated_data.get('logo'),
                address=validated_data.get('address'),
                phone=validated_data.get('phone'),
                is_approved=False
            )

        return user


# ---------------- PRODUCT ----------------
class ProductSerializer(serializers.ModelSerializer):
    vendor_shop = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'vendor',
            'vendor_shop',
            'name',
            'price',
            'stock_quantity',
            'image',
            'description',
            'status',
            'category',
            'created_at'
        ]
        read_only_fields = ['vendor', 'status']

    def get_vendor_shop(self, obj):
        return obj.vendor.shop_name


# ---------------- ORDER ITEM ----------------
class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    vendor_shop = serializers.CharField(
        source='vendor.shop_name', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_details',
            'vendor',
            'vendor_shop',
            'quantity',
            'price'
        ]


# ---------------- ORDER ----------------
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    buyer_name = serializers.CharField(source='user.name', read_only=True)
    buyer_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'buyer_name',
            'buyer_email',
            'items',
            'total_price',
            'address',
            'phone',
            'status',
            'payment_status',
            'razorpay_order_id',
            'razorpay_payment_id',
            'created_at',
        ]
        read_only_fields = [
            'user',
            'status',
            'payment_status',
            'razorpay_order_id',
            'razorpay_payment_id',
            'created_at',
        ]


# ---------------- VENDOR ORDER UPDATE ----------------
class VendorOrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def validate_status(self, value):
        # Optional: simple validation (since multi-vendor now)
        valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered']

        if value not in valid_statuses:
            raise serializers.ValidationError("Invalid status")

        return value


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_details', 'quantity']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items']


class CategoryRequestSerializer(serializers.ModelSerializer):
    vendor_shop = serializers.CharField(
        source='requested_by.shop_name', read_only=True
    )

    class Meta:
        model = CategoryRequest
        fields = [
            'id', 'name', 'image', 'requested_by',
            'vendor_shop', 'status', 'created_at'
        ]
        read_only_fields = ['requested_by', 'status', 'created_at']


class OfferSerializer(serializers.ModelSerializer):
    vendor_shop = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            'id', 'title', 'image', 'start_date', 'end_date',
            'requested_by', 'vendor_shop', 'status', 'created_at'
        ]
        read_only_fields = ['requested_by', 'status', 'created_at']

    def get_vendor_shop(self, obj):
        if obj.requested_by:
            return obj.requested_by.shop_name
        return 'Admin'

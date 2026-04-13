from rest_framework import serializers
from .models import CustomUser, VendorProfile, Product, Order


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'name', 'email', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    shop_name = serializers.CharField(write_only=True, required=False)
    contact_details = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'name',
            'email',
            'password',
            'role',
            'shop_name',
            'contact_details']

    def validate(self, data):
        if data.get('role') == 'vendor':
            if not data.get('shop_name') or not data.get('contact_details'):
                raise serializers.ValidationError(
                    "Vendor must provide shop_name and contact_details.")
        return data

    def create(self, validated_data):
        role = validated_data.get('role', 'buyer')
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            role=role,
            username=validated_data['email']  # username is required internally
        )
        if role == 'vendor':
            VendorProfile.objects.create(
                user=user,
                shop_name=validated_data.get('shop_name'),
                contact_details=validated_data.get('contact_details')
            )
        return user


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
            'image',
            'description']
        read_only_fields = ['vendor']

    def get_vendor_shop(self, obj):
        return obj.vendor.shop_name


class OrderSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    buyer_name = serializers.CharField(source='buyer.name', read_only=True)
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'buyer', 'buyer_name', 'buyer_email',
            'vendor', 'product', 'product_details',
            'quantity', 'address', 'phone', 'status',
            'razorpay_order_id', 'razorpay_payment_id', 'payment_status',
            'created_at', 'sent_to_factory_at', 'shipped_at', 'delivered_at',
        ]
        read_only_fields = [
            'buyer', 'vendor', 'status',
            'razorpay_order_id', 'razorpay_payment_id', 'payment_status',
            'created_at', 'sent_to_factory_at', 'shipped_at', 'delivered_at',
        ]


class VendorOrderUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def validate_status(self, value):
        """Ensure the status transition follows the valid order flow."""
        order = self.instance
        if not order.can_transition_to(value):
            raise serializers.ValidationError(
                f"Cannot transition from '{
                    order.status}' to '{value}'. " f"Valid next statuses: {
                    order.VALID_TRANSITIONS.get(
                        order.status, [])}")
        return value

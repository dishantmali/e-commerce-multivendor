import razorpay
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import CustomUser, Product, Order
from .serializers import (
    RegisterSerializer, CustomUserSerializer, ProductSerializer,
    OrderSerializer, VendorOrderUpdateSerializer
)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET))


# ---------------- Auth APIs ---------------- #
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    """Returns the current authenticated user's profile."""
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ---------------- Product APIs ---------------- #
class ProductListView(generics.ListAPIView):
    # Buyer & Public APIs: List all products
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


class ProductDetailView(generics.RetrieveAPIView):
    # Buyer & Public APIs: View product details
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


# ---------------- Vendor APIs ---------------- #
class VendorProductListCreateView(generics.ListCreateAPIView):
    # Vendor APIs: create product, view own products
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'vendor':
            return Product.objects.none()
        return Product.objects.filter(vendor__user=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'vendor':
            raise PermissionDenied("Only vendors can create products.")
        vendor_profile = hasattr(
            self.request.user,
            'vendor_profile') and self.request.user.vendor_profile
        if not vendor_profile:
            raise ValidationError("Vendor profile not found.")
        serializer.save(vendor=vendor_profile)


class VendorProductUpdateView(generics.RetrieveUpdateDestroyAPIView):
    # Vendor APIs: update product
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'vendor':
            return Product.objects.none()
        return Product.objects.filter(vendor__user=self.request.user)


# ---------------- Razorpay Payment APIs ---------------- #

class CreateRazorpayOrderView(APIView):
    """
    Step 1: Buyer submits product + delivery details.
    Backend creates a Razorpay order and returns the order_id & key to frontend.
    No DB order is created yet — that happens only after payment verification.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'buyer':
            return Response(
                {"error": "Only buyers can initiate payment."},
                status=status.HTTP_403_FORBIDDEN
            )

        product_id = request.data.get('product_id')
        address = request.data.get('address')
        phone = request.data.get('phone')
        quantity = int(request.data.get('quantity', 1))

        if not product_id or not address or not phone:
            return Response(
                {"error": "product_id, address, and phone are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Amount in paise (INR smallest unit)
        base_amount = float(product.price) * quantity
        platform_fee = base_amount * 0.05
        gst = platform_fee * 0.18
        total_amount = base_amount + platform_fee + gst
        amount_in_paise = int(total_amount * 100)

        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,  # Auto-capture payment
            "notes": {
                "product_id": str(product.id),
                "buyer_id": str(user.id),
                "address": address,
                "phone": phone,
                "quantity": str(quantity),
            }
        })

        return Response({
            "razorpay_order_id": razorpay_order["id"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "amount": amount_in_paise,
            "currency": "INR",
            "product_name": product.name,
            # Pass back delivery info so frontend can send it again on verify
            "delivery_info": {
                "product_id": product.id,
                "address": address,
                "phone": phone,
                "quantity": quantity,
            }
        }, status=status.HTTP_200_OK)


class VerifyPaymentView(APIView):
    """
    Step 2: After Razorpay checkout succeeds on frontend, it sends
    razorpay_order_id, razorpay_payment_id, razorpay_signature,
    and delivery details here.

    Backend verifies the signature, then creates the Order in DB.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role != 'buyer':
            return Response(
                {"error": "Only buyers can verify payment."},
                status=status.HTTP_403_FORBIDDEN
            )

        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        product_id = request.data.get('product_id')
        address = request.data.get('address')
        phone = request.data.get('phone')
        quantity = int(request.data.get('quantity', 1))

        if not all([razorpay_order_id, razorpay_payment_id,
                   razorpay_signature, product_id, address, phone]):
            return Response(
                {"error": "All payment and delivery fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify signature using Razorpay utility
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {"error": "Payment verification failed. Invalid signature."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Signature is valid — create the order in DB
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Verify the requested quantity against the razorpay order amount
        try:
            rzp_order = razorpay_client.order.fetch(razorpay_order_id)
            base_amount = float(product.price) * quantity
            platform_fee = base_amount * 0.05
            gst = platform_fee * 0.18
            total_amount = base_amount + platform_fee + gst
            expected_amount = int(total_amount * 100)
            if rzp_order.get('amount') != expected_amount:
                return Response(
                    {"error": "Payment amount does not match the requested quantity."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception:
            return Response(
                {"error": "Failed to verify order details with Razorpay."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = Order.objects.create(
            buyer=user,
            vendor=product.vendor,
            product=product,
            quantity=quantity,
            address=address,
            phone=phone,
            status='pending',
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
            payment_status='paid',
        )

        serializer = OrderSerializer(order)
        return Response({
            "message": "Payment verified and order created successfully!",
            "order": serializer.data,
        }, status=status.HTTP_201_CREATED)


# ---------------- Order APIs ---------------- #
class OrderListView(generics.ListAPIView):
    """List orders for the authenticated user (buyer sees their own, vendor sees orders they received)."""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'buyer':
            return Order.objects.filter(buyer=user).order_by('-created_at')
        elif user.role == 'vendor':
            if hasattr(user, 'vendor_profile'):
                return Order.objects.filter(
                    vendor=user.vendor_profile).order_by('-created_at')
            return Order.objects.none()
        return Order.objects.none()


class VendorOrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = VendorOrderUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'vendor' or not hasattr(user, 'vendor_profile'):
            return Order.objects.none()
        return Order.objects.filter(vendor=user.vendor_profile)

    def perform_update(self, serializer):
        if self.request.user.role != 'vendor':
            raise PermissionDenied("Only vendors can update order status.")

        new_status = serializer.validated_data.get('status')
        timestamp_fields = {
            'sent_to_factory': 'sent_to_factory_at',
            'shipped': 'shipped_at',
            'delivered': 'delivered_at',
        }

        # Auto-set the timestamp for the new status
        extra_kwargs = {}
        if new_status in timestamp_fields:
            extra_kwargs[timestamp_fields[new_status]] = timezone.now()

        serializer.save(**extra_kwargs)

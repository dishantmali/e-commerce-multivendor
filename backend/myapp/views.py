import razorpay
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import CustomUser, Product, Order, VendorProfile, OrderItem , Category , Cart , CartItem
from .serializers import (
    RegisterSerializer, CustomUserSerializer, ProductSerializer,
    OrderSerializer, VendorOrderUpdateSerializer , CategorySerializer , CartSerializer
)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


# ---------------- Auth APIs ---------------- #
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class HomePageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        products = Product.objects.filter(status='approved')[:10]
        new_products = Product.objects.filter(
            status='approved'
        ).order_by('-created_at')[:10]

        return Response({
            "categories": CategorySerializer(categories, many=True, context={'request': request}).data,
            "featured_products": ProductSerializer(products, many=True, context={'request': request}).data,
            "new_products": ProductSerializer(new_products, many=True, context={'request': request}).data,
        })


# ---------------- Product APIs ---------------- #
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(status='approved')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(status='approved')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


# ---------------- Vendor APIs ---------------- #
class VendorProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'vendor':
            return Product.objects.none()
        return Product.objects.filter(vendor__user=self.request.user)

    def perform_create(self, serializer):
        if self.request.user.role != 'vendor':
            raise PermissionDenied("Only vendors can create products.")

        vendor_profile = getattr(self.request.user, 'vendor_profile', None)

        if not vendor_profile:
            raise ValidationError("Vendor profile not found.")

        if not vendor_profile.is_approved:
            raise PermissionDenied("Vendor not approved by admin.")

        serializer.save(vendor=vendor_profile, status='pending')


class VendorProductUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'vendor':
            return Product.objects.none()
        return Product.objects.filter(vendor__user=self.request.user)


# ---------------- Admin APIs ---------------- #
class AdminProductApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        if request.user.role != 'admin':
            raise PermissionDenied("Only admin can approve products.")

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        action = request.data.get('action')

        if action not in ['approve', 'reject']:
            return Response({"error": "Invalid action"}, status=400)

        if product.status == 'approved' and action == 'approve':
            return Response({"message": "Product already approved"}, status=400)

        if action == 'approve':
            product.status = 'approved'
        else:
            product.status = 'rejected'

        product.save()

        return Response({"message": f"Product {action}d successfully"})


class AdminVendorApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, vendor_id):
        if request.user.role != 'admin':
            raise PermissionDenied("Only admin can manage vendors.")

        try:
            vendor = VendorProfile.objects.get(id=vendor_id)
        except VendorProfile.DoesNotExist:
            return Response({"error": "Vendor not found"}, status=404)

        action = request.data.get('action')  # approve / reject

        if action == 'approve':
            if vendor.is_approved:
                return Response({"message": "Vendor already approved"}, status=400)
            vendor.is_approved = True

        elif action == 'reject':
            vendor.delete()
            return Response({"message": "Vendor rejected and removed"})

        else:
            return Response({"error": "Invalid action"}, status=400)

        vendor.save()
        return Response({"message": "Vendor approved successfully"})
    
class AdminPendingProductsView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin can view pending products.")
        return Product.objects.filter(status='pending')
    
    
class AdminPendingVendorsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin can view vendors.")
        return VendorProfile.objects.filter(is_approved=False)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        data = [
            {
                "id": v.id,
                "shop_name": v.shop_name,
                "email": v.user.email,
                "phone": v.phone,
                "address": v.address,
            }
            for v in queryset
        ]

        return Response(data)

# ---------------- Razorpay Payment APIs ---------------- #
class CreateRazorpayOrderView(APIView):
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
            product = Product.objects.get(id=product_id, status='approved')
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        base_amount = float(product.price) * quantity
        platform_fee = base_amount * 0.05
        gst = platform_fee * 0.18
        total_amount = base_amount + platform_fee + gst
        amount_in_paise = int(total_amount * 100)

        razorpay_order = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,
        })

        return Response({
            "razorpay_order_id": razorpay_order["id"],
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
            "amount": amount_in_paise,
            "currency": "INR",
            "product_name": product.name,
            "delivery_info": {
                "product_id": product.id,
                "address": address,
                "phone": phone,
                "quantity": quantity,
            }
        })


class VerifyPaymentView(APIView):
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

        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except:
            return Response({"error": "Payment verification failed"}, status=400)

        product = Product.objects.get(id=product_id)

        total_amount = float(product.price) * quantity

        order = Order.objects.create(
            user=user,
            address=address,
            phone=phone,
            status='pending',
            payment_status='paid',
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            razorpay_signature=razorpay_signature,
            total_price=total_amount
        )

        OrderItem.objects.create(
            order=order,
            product=product,
            vendor=product.vendor,
            quantity=quantity,
            price=product.price
        )

        serializer = OrderSerializer(order)

        return Response({
            "message": "Order placed successfully",
            "order": serializer.data
        })


# ---------------- Order APIs ---------------- #
class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'buyer':
            return Order.objects.filter(user=user).order_by('-created_at')

        elif user.role == 'vendor':
            if hasattr(user, 'vendor_profile'):
                return Order.objects.filter(
                    items__vendor=user.vendor_profile
                ).distinct().order_by('-created_at')

        return Order.objects.none()


class VendorOrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = VendorOrderUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role != 'vendor' or not hasattr(user, 'vendor_profile'):
            return Order.objects.none()

        return Order.objects.filter(
            items__vendor=user.vendor_profile
        ).distinct()

    def perform_update(self, serializer):
        new_status = serializer.validated_data.get('status')

        timestamp_fields = {
            'confirmed': 'confirmed_at',
            'shipped': 'shipped_at',
            'delivered': 'delivered_at',
        }

        extra_kwargs = {}

        if new_status in timestamp_fields:
            extra_kwargs[timestamp_fields[new_status]] = timezone.now()

        serializer.save(**extra_kwargs)

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart,context={'request': request})
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        product = Product.objects.get(id=product_id, status='approved')

        cart, _ = Cart.objects.get_or_create(user=request.user)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product
        )

        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity

        item.save()

        return Response({"message": "Added to cart"})
    
class RemoveFromCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            # Ensure the user only deletes items from their own cart
            cart = Cart.objects.get(user=request.user)
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            return Response({"message": "Item removed from cart"}, status=status.HTTP_200_OK)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)
    
class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        cart = Cart.objects.get(user=user)
        items = cart.items.all()

        if not items:
            return Response({"error": "Cart is empty"}, status=400)

        address = request.data.get('address')
        phone = request.data.get('phone')

        total = 0
        for item in items:
            total += item.product.price * item.quantity

        order = Order.objects.create(
            user=user,
            address=address,
            phone=phone,
            total_price=total,
            payment_status='pending'
        )

        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                vendor=item.product.vendor,
                quantity=item.quantity,
                price=item.product.price
            )

        cart.items.all().delete()

        return Response({"message": "Order created", "order_id": order.id})
from re import search
from django.core.cache import cache
import razorpay
from datetime import date
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db import transaction , models
from .models import (
    CustomUser, Product, Order, VendorProfile, OrderItem,
    Category, Cart, CartItem, CategoryRequest, Offer , Wishlist
)
from .serializers import (
    RegisterSerializer, CustomUserSerializer, ProductSerializer,
    OrderSerializer,OrderItemSerializer, VendorOrderUpdateSerializer, CategorySerializer,
    CartSerializer, CategoryRequestSerializer, OfferSerializer, WishlistSerializer
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
    pagination_class = None

    def get(self, request):
        categories = Category.objects.all()
        products = Product.objects.filter(status='approved')[:10]
        new_products = Product.objects.filter(
            status='approved'
        ).order_by('-created_at')[:10]

        today = date.today()
        active_offers = Offer.objects.filter(
            status='approved',
            end_date__gte=today
        )
        
        top_vendors = VendorProfile.objects.filter(is_approved=True)[:10]

        return Response({
            "categories": CategorySerializer(
                categories, many=True,
                context={'request': request}
            ).data,
            "featured_products": ProductSerializer(
                products, many=True,
                context={'request': request}
            ).data,
            "new_products": ProductSerializer(
                new_products, many=True,
                context={'request': request}
            ).data,
            "offers": OfferSerializer(
                active_offers, many=True,
                context={'request': request}
            ).data,
            "vendors": [
                {
                    "shop_name": v.shop_name,
                    # build_absolute_uri ensures the full URL is sent (e.g., http://127.0.0.1:8000/media/...)
                    "logo": request.build_absolute_uri(v.logo.url) if v.logo else None
                } 
                for v in top_vendors
            ]
        })


# ---------------- Product APIs ---------------- #
class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.filter(status='approved')

        # Category Filter
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Search Filter (Checks name or description)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) | 
                models.Q(description__icontains=search) |
                models.Q(vendor__shop_name__icontains=search) |
                models.Q(category__name__icontains=search)
            )
        # Price Filters
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return queryset.distinct()


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(status='approved')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


class CategoryListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # 1. Try to fetch from 'memory'
        cached_categories = cache.get('global_categories')

        if cached_categories:
            print("Cache Hit: Serving from RAM")
            return Response(cached_categories)

        # 2. If not in memory, fetch from DB
        print("Cache Miss: Fetching from Database")
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        data = serializer.data

        # 3. Save to memory for 24 hours (86400 seconds)
        cache.set('global_categories', data, 86400)

        return Response(data)

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
            return Response(
                {"message": "Product already approved"}, status=400)

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
                return Response(
                    {"message": "Vendor already approved"}, status=400)
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


class AdminUserListView(generics.ListAPIView):
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin can view users.")
        return CustomUser.objects.filter(role='buyer').order_by('-date_joined')


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    queryset = Category.objects.all()

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin can create categories.")
        serializer.save()


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Category.objects.all()

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin can delete categories.")
        instance.delete()


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Only admin can view global orders.")
        return Order.objects.all().order_by('-created_at')

# ---------- Vendor Category & Offer Requests ---------- #

class VendorCategoryRequestView(generics.ListCreateAPIView):
    serializer_class = CategoryRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.role != 'vendor':
            return CategoryRequest.objects.none()
        return CategoryRequest.objects.filter(
            requested_by__user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'vendor':
            raise PermissionDenied("Only vendors can request categories.")
        vendor = getattr(self.request.user, 'vendor_profile', None)
        if not vendor:
            raise ValidationError("Vendor profile not found.")
        serializer.save(requested_by=vendor, status='pending')


class VendorOfferRequestView(generics.ListCreateAPIView):
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.role != 'vendor':
            return Offer.objects.none()
        return Offer.objects.filter(
            requested_by__user=self.request.user
        ).order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'vendor':
            raise PermissionDenied("Only vendors can request offers.")
        vendor = getattr(self.request.user, 'vendor_profile', None)
        if not vendor:
            raise ValidationError("Vendor profile not found.")
        serializer.save(requested_by=vendor, status='pending')


# ---------- Admin Category Request Management ---------- #

class AdminCategoryRequestListView(generics.ListAPIView):
    serializer_class = CategoryRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Admin only.")
        return CategoryRequest.objects.all().order_by('-created_at')


class AdminCategoryRequestActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'admin':
            raise PermissionDenied("Admin only.")

        try:
            cat_req = CategoryRequest.objects.get(id=pk)
        except CategoryRequest.DoesNotExist:
            return Response(
                {"error": "Request not found"}, status=404
            )

        action = request.data.get('action')

        if action == 'approve':
            Category.objects.create(
                name=cat_req.name,
                image=cat_req.image
            )
            cat_req.status = 'approved'
            cat_req.save()
            return Response(
                {"message": "Category request approved and created"}
            )
        elif action == 'reject':
            cat_req.status = 'rejected'
            cat_req.save()
            return Response(
                {"message": "Category request rejected"}
            )

        return Response({"error": "Invalid action"}, status=400)


# ---------- Admin Offer Management ---------- #

class AdminOfferListCreateView(generics.ListCreateAPIView):
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Admin only.")
        return Offer.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise PermissionDenied("Admin only.")
        serializer.save(requested_by=None, status='approved')


class AdminOfferActionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        if request.user.role != 'admin':
            raise PermissionDenied("Admin only.")

        try:
            offer = Offer.objects.get(id=pk)
        except Offer.DoesNotExist:
            return Response(
                {"error": "Offer not found"}, status=404
            )

        action = request.data.get('action')

        if action == 'approve':
            offer.status = 'approved'
            offer.save()
            return Response({"message": "Offer approved"})
        elif action == 'reject':
            offer.status = 'rejected'
            offer.save()
            return Response({"message": "Offer rejected"})

        return Response({"error": "Invalid action"}, status=400)

    def delete(self, request, pk):
        if request.user.role != 'admin':
            raise PermissionDenied("Admin only.")

        try:
            offer = Offer.objects.get(id=pk)
            offer.delete()
            return Response({"message": "Offer deleted"})
        except Offer.DoesNotExist:
            return Response(
                {"error": "Offer not found"}, status=404
            )


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

        # 1. Verify Razorpay Signature
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except Exception:
            return Response({"error": "Payment verification failed. Invalid signature."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 2. Atomic Transaction for Stock Check, Decrement, and Order Creation
        try:
            with transaction.atomic():
                # Lock the product row using select_for_update() to prevent race conditions
                product = Product.objects.select_for_update().get(id=product_id)

                # Check if enough stock is available
                if product.stock_quantity < quantity:
                    return Response(
                        {"error": f"Insufficient stock. Only {product.stock_quantity} available."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Decrement the stock quantity and save
                product.stock_quantity -= quantity
                product.save()

                total_amount = float(product.price) * quantity

                # Create Order
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

                # Create OrderItem
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    vendor=product.vendor,
                    quantity=quantity,
                    price=product.price
                )

        except Product.DoesNotExist:
            return Response({"error": "Product not found."},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order)

        return Response({
            "message": "Order placed successfully",
            "order": serializer.data
        }, status=status.HTTP_201_CREATED)

# ---------------- Order APIs ---------------- #

class OrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    # Buyers get full Orders, Vendors get a list of their specific OrderItems
    def get_serializer_class(self):
        if self.request.user.role == 'vendor':
            return OrderItemSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'buyer':
            return Order.objects.filter(user=user).order_by('-created_at')
        elif user.role == 'vendor':
            if hasattr(user, 'vendor_profile'):
                return OrderItem.objects.filter(vendor=user.vendor_profile).order_by('-order__created_at')
        return Order.objects.none()


class VendorOrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = VendorOrderUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role != 'vendor' or not hasattr(user, 'vendor_profile'):
            return OrderItem.objects.none()
        # Ensure vendors can only update their own items
        return OrderItem.objects.filter(vendor=user.vendor_profile)

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
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class AddToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id, status='approved')
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Immediate Stock Check
        if product.stock_quantity <= 0:
            return Response({"error": "This product is currently out of stock."}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        
        # 2. Check existing cart quantity
        item = CartItem.objects.filter(cart=cart, product=product).first()
        current_qty = item.quantity if item else 0
        new_qty = current_qty + quantity

        # 3. Limit Check
        if new_qty > product.stock_quantity:
             return Response(
                 {"error": f"Cannot add. Only {product.stock_quantity} available (You have {current_qty} in cart)."}, 
                 status=status.HTTP_400_BAD_REQUEST
             )

        # 4. Save
        if item:
            item.quantity = new_qty
            item.save()
        else:
            CartItem.objects.create(cart=cart, product=product, quantity=new_qty)

        return Response({"message": "Added to cart"})


class RemoveFromCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            cart = Cart.objects.get(user=request.user)
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
            return Response({"message": "Item removed from cart"},
                            status=status.HTTP_200_OK)
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            return Response({"error": "Item not found in cart"},
                            status=status.HTTP_404_NOT_FOUND)


class CheckoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        
        try:
            cart = Cart.objects.get(user=user)
            items = cart.items.all()
        except Cart.DoesNotExist:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        if not items:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate total amount
        base_amount = sum(float(item.product.price) * item.quantity for item in items)
        platform_fee = base_amount * 0.05
        gst = platform_fee * 0.18
        total_amount = base_amount + platform_fee + gst
        amount_in_paise = int(total_amount * 100)

        # Create Razorpay order (DO NOT delete cart items yet!)
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
        })

class VerifyCartPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        address = request.data.get('address')
        phone = request.data.get('phone')

        # 1. Verify Signature
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
            })
        except Exception:
            return Response({"error": "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Process Cart Atomically
        try:
            cart = Cart.objects.get(user=user)
            items = cart.items.all()
            
            with transaction.atomic():
                # Lock all products in the cart
                product_ids = [item.product.id for item in items]
                products = Product.objects.select_for_update().filter(id__in=product_ids)
                product_map = {p.id: p for p in products}
                
                total_amount = 0
                
                # Check stock for all items
                for item in items:
                    product = product_map.get(item.product.id)
                    if product.stock_quantity < item.quantity:
                        return Response(
                            {"error": f"Insufficient stock for {product.name}. Only {product.stock_quantity} left."},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    total_amount += float(product.price) * item.quantity
                    
                # Add fees
                platform_fee = total_amount * 0.05
                gst = platform_fee * 0.18
                final_total = total_amount + platform_fee + gst

                # Create Order
                order = Order.objects.create(
                    user=user, address=address, phone=phone,
                    # status='pending', 
                    payment_status='paid',
                    razorpay_order_id=razorpay_order_id,
                    razorpay_payment_id=razorpay_payment_id,
                    razorpay_signature=razorpay_signature,
                    total_price=final_total
                )

                # Create OrderItems & Decrement Stock
                for item in items:
                    product = product_map[item.product.id]
                    product.stock_quantity -= item.quantity
                    product.save()
                    
                    OrderItem.objects.create(
                        order=order, product=product, vendor=product.vendor,
                        quantity=item.quantity, price=product.price
                    )

                # Clear Cart NOW (after successful payment and order creation)
                items.delete()

            return Response({"message": "Order placed successfully"}, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Checkout Error: {e}")
            return Response({"error": "An error occurred while processing your order."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class WishlistToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated] #

    def post(self, request):
        if request.user.role != 'buyer':
            return Response(
                {"error": "Only buyers can maintain a wishlist."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"error": "Product ID required"}, status=400)
        
        try:
            product = Product.objects.get(id=product_id) #
            # get_or_create returns a tuple (object, created_boolean)
            wishlist_item, created = Wishlist.objects.get_or_create(
                user=request.user, 
                product=product
            )

            if not created:
                # If it already existed, we "toggle" it off by deleting it
                wishlist_item.delete()
                return Response({"message": "Removed from wishlist", "added": False})
            
            return Response({"message": "Added to wishlist", "added": True}, status=201)
            
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistSerializer # You'll need to create this in serializers.py
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return the wishlist items for the logged-in user
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

class MergeCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        local_items = request.data.get('items', [])
        cart, _ = Cart.objects.get_or_create(user=request.user)

        for item in local_items:
            product_id = item.get('product_id')
            quantity = item.get('quantity', 1)
            
            try:
                product = Product.objects.get(id=product_id, status='approved')
                if product.stock_quantity > 0:
                    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
                    if not created:
                        cart_item.quantity += quantity
                    else:
                        cart_item.quantity = quantity
                    cart_item.save()
            except Product.DoesNotExist:
                continue

        return Response({"message": "Cart merged successfully"})
    
class MergeWishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        local_items = request.data.get('items', [])
        
        for item in local_items:
            product_id = item.get('product')
            if isinstance(product_id, dict):
                product_id = product_id.get('id')
                
            try:
                product = Product.objects.get(id=product_id, status='approved')
                Wishlist.objects.get_or_create(user=request.user, product=product)
            except Product.DoesNotExist:
                continue

        return Response({"message": "Wishlist merged successfully"})
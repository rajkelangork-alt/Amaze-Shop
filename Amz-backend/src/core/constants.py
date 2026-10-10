import enum
from enum import Enum


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    ADMIN = "admin"


class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentMethod(str, Enum):
    STRIPE = "stripe"
    PAYPAL = "paypal"
    CASH_ON_DELIVERY = "cod"


class InventoryTransactionType(str, Enum):
    PURCHASE = "purchase"
    RESTOCK = "restock"
    RETURN = "return"
    ADJUSTMENT = "adjustment"
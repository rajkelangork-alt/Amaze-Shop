import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from src.core.constants import PaymentMethod, PaymentStatus
from src.core.exceptions import NotFoundException
from src.models.payment import Payment
from src.repositories.order_repository import OrderRepository
from src.schemas.payment import PaymentResponse, StripePaymentIntentResponse


class PaymentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.order_repo = OrderRepository(session)

    async def create_stripe_intent(self, order_id: int, user_id: int) -> StripePaymentIntentResponse:
        order = await self.order_repo.get_order_by_id(order_id, user_id=user_id)
        if not order:
            raise NotFoundException(detail="Order not found")

        fake_client_secret = f"pi_{uuid.uuid4().hex}_secret_{uuid.uuid4().hex[:16]}"
        return StripePaymentIntentResponse(
            client_secret=fake_client_secret,
            publishable_key="pk_test_sample_key",
            amount=Decimal(str(order.total_amount)),
            currency="usd",
        )

    async def record_payment(
        self,
        order_id: int,
        method: PaymentMethod,
        amount: Decimal,
        tx_id: str | None = None,
    ) -> PaymentResponse:
        payment = Payment(
            order_id=order_id,
            payment_method=method,
            status=PaymentStatus.COMPLETED,
            amount=amount,
            transaction_id=tx_id or f"txn_{uuid.uuid4().hex[:12]}",
        )
        self.session.add(payment)
        await self.session.commit()
        return PaymentResponse(
            id=payment.id,
            order_id=payment.order_id,
            payment_method=payment.payment_method,
            status=payment.status,
            amount=Decimal(str(payment.amount)),
            transaction_id=payment.transaction_id,
        )
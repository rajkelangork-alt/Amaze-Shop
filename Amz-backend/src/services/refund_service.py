import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import NotFoundException
from src.models.payment import Payment
from src.models.refund import Refund
from src.schemas.refund import RefundCreate, RefundResponse


class RefundService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def request_refund(self, payload: RefundCreate) -> RefundResponse:
        payment = (await self.session.execute(select(Payment).where(Payment.id == payload.payment_id))).scalars().first()
        if not payment:
            raise NotFoundException(detail="Payment transaction not found")

        refund = Refund(
            payment_id=payment.id,
            amount=payload.amount,
            reason=payload.reason,
            status="SUCCESS",
            refund_transaction_id=f"ref_{uuid.uuid4().hex[:12]}",
        )
        self.session.add(refund)
        await self.session.commit()

        return RefundResponse(
            id=refund.id,
            payment_id=refund.payment_id,
            amount=Decimal(str(refund.amount)),
            reason=refund.reason,
            status=refund.status,
            refund_transaction_id=refund.refund_transaction_id,
            created_at=refund.created_at,
        )
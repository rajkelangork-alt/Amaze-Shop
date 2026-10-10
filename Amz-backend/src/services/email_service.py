import logging

logger = logging.getLogger("email_service")


class EmailService:
    @staticmethod
    async def send_order_confirmation(email: str, order_number: str) -> None:
        logger.info(f"[MOCK EMAIL] Order confirmation for #{order_number} sent to {email}")

    @staticmethod
    async def send_welcome_email(email: str, first_name: str) -> None:
        logger.info(f"[MOCK EMAIL] Welcome email sent to {first_name} ({email})")
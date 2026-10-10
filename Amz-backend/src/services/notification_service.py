import logging

from sqlalchemy.ext.asyncio import AsyncSession

from src.models.notification import Notification

logger = logging.getLogger("notifications")


class NotificationService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def send_user_notification(self, user_id: int, title: str, message: str) -> None:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
        )
        self.session.add(notification)
        await self.session.commit()
        logger.info(f"Notification queued for User {user_id}: {title}")
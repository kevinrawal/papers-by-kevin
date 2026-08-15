from datetime import datetime, timezone

from sqlalchemy import DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Post(Base):
    """An article.

    `date` and `read` are display strings ("Jul 2026", "12 min"), exactly as the
    design writes them — they are copy, not timestamps. `created_at` is the real
    clock, and it is what orders the lists.
    """

    __tablename__ = "posts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(500), default="")
    topic: Mapped[str] = mapped_column(String(120), default="")
    dek: Mapped[str] = mapped_column(Text, default="")
    date: Mapped[str] = mapped_column(String(60), default="")
    read: Mapped[str] = mapped_column(String(60), default="")
    status: Mapped[str] = mapped_column(String(20), default="draft")
    tags: Mapped[str] = mapped_column(String(300), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    kind: Mapped[str] = mapped_column(String(120), default="")
    name: Mapped[str] = mapped_column(String(300), default="")
    blurb: Mapped[str] = mapped_column(Text, default="")
    learned: Mapped[str] = mapped_column(Text, default="")
    stack: Mapped[str] = mapped_column(String(300), default="")
    href: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

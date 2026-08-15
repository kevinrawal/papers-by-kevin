from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Status = Literal["draft", "published"]


class PostIn(BaseModel):
    """What the desk sends. `id` is optional on create — the server mints one."""

    id: str | None = Field(default=None, max_length=64)
    title: str = ""
    topic: str = ""
    dek: str = ""
    date: str = ""
    read: str = ""
    status: Status = "draft"
    tags: str = ""
    body: str = ""


class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    topic: str
    dek: str
    date: str
    read: str
    status: Status
    tags: str
    body: str


class ProjectIn(BaseModel):
    id: str | None = Field(default=None, max_length=64)
    kind: str = ""
    name: str = ""
    blurb: str = ""
    learned: str = ""
    stack: str = ""
    href: str = ""


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kind: str
    name: str
    blurb: str
    learned: str
    stack: str
    href: str


class LoginIn(BaseModel):
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

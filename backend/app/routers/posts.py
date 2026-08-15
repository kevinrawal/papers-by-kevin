from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Post
from ..schemas import PostIn, PostOut
from ..security import is_admin, require_admin

router = APIRouter(prefix="/api/posts", tags=["posts"])


def _get_or_404(db: Session, post_id: str) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such entry")
    return post


@router.get("", response_model=list[PostOut])
def list_posts(
    include_drafts: bool = False,
    db: Session = Depends(get_db),
    admin: bool = Depends(is_admin),
) -> list[Post]:
    if include_drafts and not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Drafts are desk-only"
        )
    stmt = select(Post).order_by(Post.created_at.desc(), Post.id)
    if not include_drafts:
        stmt = stmt.where(Post.status == "published")
    return list(db.scalars(stmt))


@router.get("/{post_id}", response_model=PostOut)
def get_post(
    post_id: str,
    db: Session = Depends(get_db),
    admin: bool = Depends(is_admin),
) -> Post:
    post = _get_or_404(db, post_id)
    # A draft is invisible to the public — 404 rather than 403, so an unpublished
    # headline cannot be probed for by id.
    if post.status == "draft" and not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No such entry")
    return post


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> Post:
    post_id = payload.id or f"p{uuid4().hex[:12]}"
    if db.get(Post, post_id) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="That id is taken")
    post = Post(**{**payload.model_dump(), "id": post_id})
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: str,
    payload: PostIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> Post:
    post = _get_or_404(db, post_id)
    for field, value in payload.model_dump(exclude={"id"}).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: str,
    db: Session = Depends(get_db),
    _: str = Depends(require_admin),
) -> Response:
    db.delete(_get_or_404(db, post_id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

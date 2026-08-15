from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas import ResetOut
from ..security import require_admin
from ..seed import reset_to_seed

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/reset", response_model=ResetOut)
def reset(db: Session = Depends(get_db), _: str = Depends(require_admin)) -> ResetOut:
    """Backs the desk's "Reset to sample" button: wipe, then re-insert the seed."""
    posts, projects = reset_to_seed(db)
    return ResetOut(posts=posts, projects=projects)

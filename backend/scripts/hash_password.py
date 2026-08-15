"""Print a bcrypt hash for the admin password.

    python scripts/hash_password.py

Paste the output into backend/.env as ADMIN_PASSWORD_HASH.
"""

import getpass
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.security import hash_password  # noqa: E402


def main() -> int:
    password = getpass.getpass("Admin password: ")
    if not password:
        print("Nothing entered.")
        return 1
    if password != getpass.getpass("Again: "):
        print("They do not match.")
        return 1
    print()
    print(f"ADMIN_PASSWORD_HASH={hash_password(password)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

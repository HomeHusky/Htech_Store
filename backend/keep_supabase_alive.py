#!/usr/bin/env python
"""Touch the Supabase database with a minimal query.

Run this on a schedule to keep the database from going idle.
"""

from __future__ import annotations

from datetime import datetime, timezone
import sys

from sqlalchemy import create_engine, text

from app.core.config import settings


def main() -> int:
    engine = create_engine(settings.database_url, pool_pre_ping=True)

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            connection.commit()
    except Exception as error:
        print(f"✗ Supabase keepalive failed: {error}")
        return 1

    timestamp = datetime.now(tz=timezone.utc).isoformat()
    print(f"✓ Supabase keepalive sent at {timestamp}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
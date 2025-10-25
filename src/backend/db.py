import os
import enum
import json
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse
from contextlib import contextmanager

import psycopg2
import psycopg2.pool


class EventStatus(enum.Enum):
    QUEUED = 0
    RUNNING = 1
    COMPLETE = 2


class UserRole(enum.Enum):
    STUDENT = 1
    TEACHER = 2
    ADMIN = 3


class FileRole(enum.Enum):
    STUDENT_COPY = 1
    STUDENT_RESPONSE = 2
    TEACHER_KEY = 3
    TEACHER_CONTEXT = 4


class TaskType(enum.Enum):
    SINGLE_PDF = 1
    MANY_TEXT = 2


SCHEMA = """
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    openid VARCHAR(254) PRIMARY KEY,
    email TEXT,
    role INT, -- UserRole
    classes UUID[]
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    assignments UUID[]
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    attrs TEXT, -- JSON dict TODO
    context TEXT,
    files UUID[]
);

-- All files that are in the site
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_user UUID,
    file_role INT, -- FileRole
    context TEXT
);

CREATE TABLE IF NOT EXISTS file_cache (
    id UUID PRIMARY KEY, -- Same as key in `files`
    results TEXT
);

CREATE TABLE IF NOT EXISTS file_task (
    id SERIAL PRIMARY KEY,
    isRunning BIT,
    task_type INT, -- TaskType
    files UUID[]
);
"""


class DB:
    def __init__(self) -> None:
        db_url = os.getenv(
            "DATABASE_URL",
            "postgres://appuser:apppass@localhost:5432/appdb",
        )

        parsed = urlparse(db_url)
        user = parsed.username
        password = parsed.password
        host = parsed.hostname
        port = parsed.port
        database = parsed.path.lstrip("/")

        self.pool = psycopg2.pool.SimpleConnectionPool(
            2,
            10,
            user=user,
            password=password,
            host=host,
            port=port,
            database=database,
        )

        con = self.pool.getconn()
        try:
            with con:
                with con.cursor() as cur:
                    cur.execute(SCHEMA)
        finally:
            self.pool.putconn(con)

    def close(self) -> None:
        if self.pool:
            self.pool.closeall()

    @contextmanager
    def _conn_cur(self):
        con = self.pool.getconn()
        try:
            with con:
                with con.cursor() as cur:
                    yield con, cur
        finally:
            self.pool.putconn(con)

    # -----------------------
    # Users
    # -----------------------
    def upsert_user(
        self,
        openid: str,
        email: Optional[str],
        role: UserRole,
        classes: Optional[List[str]] = None,
    ) -> None:
        classes = classes or []
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO users (openid, email, role, classes)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (openid) DO UPDATE
                SET email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    classes = EXCLUDED.classes
                """,
                (openid, email, role.value, classes),
            )

    def get_user(self, openid: str) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                "SELECT openid, email, role, classes FROM users WHERE openid = %s",
                (openid,),
            )
            row = cur.fetchone()
            if not row:
                return None
            return {
                "openid": row[0],
                "email": row[1],
                "role": row[2],
                "classes": row[3],
            }

    # -----------------------
    # Files
    # -----------------------
    def create_file(
        self,
        posted_user: Optional[str],
        file_role: FileRole,
        context: Optional[Any] = None,
    ) -> str:
        context_txt = (
            json.dumps(context) if isinstance(context, (dict, list)) else context
        )
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO files (posted_user, file_role, context)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (posted_user, file_role.value, context_txt),
            )
            (fid,) = cur.fetchone()
            return str(fid)

    def get_file(self, file_id: str) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                SELECT id, posted_user, file_role, context
                FROM files
                WHERE id = %s
                """,
                (file_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            ctx = row[3]
            try:
                parsed_ctx = json.loads(ctx) if ctx else None
            except Exception:
                parsed_ctx = ctx
            return {
                "id": str(row[0]),
                "posted_user": str(row[1]) if row[1] else None,
                "file_role": row[2],
                "context": parsed_ctx,
            }

    def delete_file(self, file_id: str) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM files WHERE id = %s", (file_id,))
            return cur.rowcount > 0

    # -----------------------
    # File cache
    # -----------------------
    def set_file_cache(self, file_id: str, results: Any) -> None:
        results_txt = json.dumps(results) if isinstance(results, (dict, list)) else str(
            results
        )
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO file_cache (id, results)
                VALUES (%s, %s)
                ON CONFLICT (id) DO UPDATE
                SET results = EXCLUDED.results
                """,
                (file_id, results_txt),
            )

    def get_file_cache(self, file_id: str) -> Optional[Any]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                "SELECT results FROM file_cache WHERE id = %s", (file_id,)
            )
            row = cur.fetchone()
            if not row:
                return None
            val = row[0]
            try:
                return json.loads(val)
            except Exception:
                return val

    def delete_file_cache(self, file_id: str) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM file_cache WHERE id = %s", (file_id,))
            return cur.rowcount > 0

    # -----------------------
    # File task queue
    # -----------------------
    def enqueue_file_task(
        self, task_type: TaskType, files: List[str]
    ) -> int:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO file_task (isRunning, task_type, files)
                VALUES (B'0', %s, %s)
                RETURNING id
                """,
                (task_type.value, files),
            )
            (task_id,) = cur.fetchone()
            return int(task_id)

    def dequeue_file_task(self) -> Optional[Dict[str, Any]]:
        # Atomically claim one queued task using SKIP LOCKED
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                WITH cte AS (
                    SELECT id
                    FROM file_task
                    WHERE isRunning = B'0'
                    ORDER BY id
                    FOR UPDATE SKIP LOCKED
                    LIMIT 1
                )
                UPDATE file_task ft
                SET isRunning = B'1'
                FROM cte
                WHERE ft.id = cte.id
                RETURNING ft.id, ft.task_type, ft.files
                """
            )
            row = cur.fetchone()
            if not row:
                return None
            return {
                "id": int(row[0]),
                "task_type": int(row[1]),
                "files": row[2] or [],
            }

    def get_file_task(self, task_id: int) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                SELECT id, isRunning, task_type, files
                FROM file_task
                WHERE id = %s
                """,
                (task_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            is_running = row[1]
            if isinstance(is_running, memoryview):
                is_running = bytes(is_running).decode()
            elif isinstance(is_running, (bytes, bytearray)):
                is_running = is_running.decode()
            is_running_bool = str(is_running) in ("1", "t", "T", "True")
            return {
                "id": int(row[0]),
                "isRunning": is_running_bool,
                "task_type": int(row[2]),
                "files": row[3] or [],
            }

    def list_file_tasks(
        self, running: Optional[bool] = None, limit: int = 100, offset: int = 0
    ) -> List[Dict[str, Any]]:
        where = ""
        params: Tuple[Any, ...] = ()
        if running is True:
            where = "WHERE isRunning = B'1'"
        elif running is False:
            where = "WHERE isRunning = B'0'"
        with self._conn_cur() as (_, cur):
            cur.execute(
                f"""
                SELECT id, isRunning, task_type, files
                FROM file_task
                {where}
                ORDER BY id
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            rows = cur.fetchall()
            out = []
            for r in rows:
                is_running = r[1]
                if isinstance(is_running, memoryview):
                    is_running = bytes(is_running).decode()
                elif isinstance(is_running, (bytes, bytearray)):
                    is_running = is_running.decode()
                is_running_bool = str(is_running) in ("1", "t", "T", "True")
                out.append(
                    {
                        "id": int(r[0]),
                        "isRunning": is_running_bool,
                        "task_type": int(r[2]),
                        "files": r[3] or [],
                    }
                )
            return out

    def complete_file_task(self, task_id: int) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM file_task WHERE id = %s", (task_id,))
            return cur.rowcount > 0

    def reset_task_to_queued(self, task_id: int) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                UPDATE file_task
                SET isRunning = B'0'
                WHERE id = %s
                """,
                (task_id,),
            )
            return cur.rowcount > 0

    def reset_all_running_to_queued(self) -> int:
        with self._conn_cur() as (_, cur):
            cur.execute(
                "UPDATE file_task SET isRunning = B'0' WHERE isRunning = B'1'"
            )
            return cur.rowcount

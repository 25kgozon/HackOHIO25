import os
import enum
import json
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse
from contextlib import contextmanager

import psycopg2
import psycopg2.pool


class EventStatus(enum.IntEnum):
    QUEUED = 0
    RUNNING = 1
    COMPLETE = 2


class UserRole(enum.IntEnum):
    STUDENT = 1
    TEACHER = 2
    ADMIN = 3


class FileRole(enum.IntEnum):
    STUDENT_COPY = 1
    STUDENT_RESPONSE = 2
    TEACHER_KEY = 3
    TEACHER_CONTEXT = 4


class TaskType(enum.IntEnum):
    GENERIC = 1


SCHEMA = """
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    openid VARCHAR(254) PRIMARY KEY,
    name TEXT,
    -- JSON as text (caller serializes)
    other_properties TEXT,
    email TEXT,
    role INT, -- UserRole
    classes UUID[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    assignments UUID[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    attrs TEXT,    -- JSON dict as text
    context TEXT,  -- JSON as text
    files UUID[] DEFAULT '{}'
);

-- All files that are in the site
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_user VARCHAR(254), -- references users.openid (no FK for now)
    file_role INT, -- FileRole
    context TEXT   -- JSON as text
);

CREATE TABLE IF NOT EXISTS file_cache (
    id UUID PRIMARY KEY, -- Same as key in `files`
    results TEXT         -- JSON as text
);

CREATE TABLE IF NOT EXISTS file_task (
    id SERIAL PRIMARY KEY,
    isRunning BOOLEAN NOT NULL DEFAULT FALSE,
    task_type INT NOT NULL,  -- TaskType
    -- JSON
    prompt_info TEXT,
    files UUID[] DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS text_task (
    id SERIAL PRIMARY KEY,
    isRunning BOOLEAN NOT NULL DEFAULT FALSE,
    -- JSON
    prompt_info TEXT
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
    # Helpers
    # -----------------------
    @staticmethod
    def _to_json_text(val: Any) -> Optional[str]:
        if val is None:
            return None
        if isinstance(val, (dict, list)):
            return json.dumps(val)
        return str(val)

    @staticmethod
    def _from_json_text(val: Optional[str]) -> Any:
        if val is None:
            return None
        try:
            return json.loads(val)
        except Exception:
            return val

    # -----------------------
    # Users
    # -----------------------
    def upsert_user(
        self,
        openid: str,
        email: Optional[str],
        role: UserRole,
        classes: Optional[List[str]] = None,
        name: Optional[str] = None,
        other_properties: Optional[Any] = None,
    ) -> None:
        classes = classes or []
        other_props_txt = self._to_json_text(other_properties)
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO users (
                    openid, name, other_properties, email, role, classes
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (openid) DO UPDATE
                SET name = EXCLUDED.name,
                    other_properties = EXCLUDED.other_properties,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    classes = EXCLUDED.classes
                """,
                (openid, name, other_props_txt, email, int(role), classes),
            )

    def get_user(self, openid: str) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                SELECT openid, name, other_properties, email, role, classes
                FROM users
                WHERE openid = %s
                """,
                (openid,),
            )
            row = cur.fetchone()
            if not row:
                return None
            return {
                "openid": row[0],
                "name": row[1],
                "other_properties": self._from_json_text(row[2]),
                "email": row[3],
                "role": int(row[4]) if row[4] is not None else None,
                "classes": row[5],
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
        context_txt = self._to_json_text(context)
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO files (posted_user, file_role, context)
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (posted_user, int(file_role), context_txt),
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
            return {
                "id": str(row[0]),
                "posted_user": row[1],
                "file_role": int(row[2]) if row[2] is not None else None,
                "context": self._from_json_text(row[3]),
            }

    def delete_file(self, file_id: str) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM files WHERE id = %s", (file_id,))
            return cur.rowcount > 0

    # -----------------------
    # File cache
    # -----------------------
    def set_file_cache(self, file_id: str, results: Any) -> None:
        results_txt = self._to_json_text(results)
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
            cur.execute("SELECT results FROM file_cache WHERE id = %s", (file_id,))
            row = cur.fetchone()
            if not row:
                return None
            return self._from_json_text(row[0])

    def delete_file_cache(self, file_id: str) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM file_cache WHERE id = %s", (file_id,))
            return cur.rowcount > 0

    # -----------------------
    # File task queue
    # -----------------------
    def enqueue_file_task(self, task_type: TaskType, files: List[str]) -> int:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO file_task (isRunning, task_type, files)
                VALUES (FALSE, %s, %s)
                RETURNING id
                """,
                (int(task_type), files),
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
                    WHERE isRunning = FALSE
                    ORDER BY id
                    FOR UPDATE SKIP LOCKED
                    LIMIT 1
                )
                UPDATE file_task ft
                SET isRunning = TRUE
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
            return {
                "id": int(row[0]),
                "isRunning": bool(row[1]),
                "task_type": int(row[2]),
                "files": row[3] or [],
            }

    def list_file_tasks(
        self, running: Optional[bool] = None, limit: int = 100, offset: int = 0
    ) -> List[Dict[str, Any]]:
        where = ""
        params: List[Any] = [limit, offset]
        if running is True:
            where = "WHERE isRunning = TRUE"
        elif running is False:
            where = "WHERE isRunning = FALSE"
        with self._conn_cur() as (_, cur):
            cur.execute(
                f"""
                SELECT id, isRunning, task_type, files
                FROM file_task
                {where}
                ORDER BY id
                LIMIT %s OFFSET %s
                """,
                params,
            )
            rows = cur.fetchall()
            out: List[Dict[str, Any]] = []
            for r in rows:
                out.append(
                    {
                        "id": int(r[0]),
                        "isRunning": bool(r[1]),
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
                SET isRunning = FALSE
                WHERE id = %s
                """,
                (task_id,),
            )
            return cur.rowcount > 0

    def reset_all_running_to_queued(self) -> int:
        with self._conn_cur() as (_, cur):
            cur.execute(
                "UPDATE file_task SET isRunning = FALSE WHERE isRunning = TRUE"
            )
            return cur.rowcount

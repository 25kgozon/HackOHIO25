import os
import enum
import json
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse
from contextlib import contextmanager


import psycopg2.extras
psycopg2.extras.register_uuid()

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
    UNKNOWN = 0
    OCR = 1
    SUMMARIZE = 2
    GRADE = 3


SCHEMA = """
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    openid VARCHAR(254) PRIMARY KEY,
    name TEXT,
    -- Json
    other_properites TEXT,
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
    posted_user VARCHAR(254),
    file_name TEXT,
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
    task_type INT,
    -- JSON
    prompt_info TEXT,
    files UUID[]
);

CREATE TABLE IF NOT EXISTS text_task (
    id SERIAL PRIMARY KEY,
    isRunning BIT,
    task_type INT,
    -- JSON
    prompt_info TEXT,
    texts TEXT[]
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
    def _bit_to_bool(val: Any) -> bool:
        if val is None:
            return False
        if isinstance(val, (bytes, bytearray, memoryview)):
            try:
                val = bytes(val).decode()
            except Exception:
                val = str(val)
        s = str(val).strip()
        return s in ("1", "t", "T", "True", "true", "B'1'")

    @staticmethod
    def _maybe_json_dump(val: Any) -> Optional[str]:
        if val is None:
            return None
        if isinstance(val, (dict, list)):
            return json.dumps(val)
        return str(val)

    @staticmethod
    def _maybe_json_load(val: Optional[str]) -> Any:
        if val is None:
            return None
        try:
            return json.loads(val)
        except Exception:
            return val

    # -----------------------
    # Users (updated schema)
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
        other_props_txt = self._maybe_json_dump(other_properties)
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO users (
                    openid, name, other_properites, email, role, classes
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (openid) DO UPDATE
                SET name = EXCLUDED.name,
                    other_properites = EXCLUDED.other_properites,
                    email = EXCLUDED.email,
                    role = EXCLUDED.role,
                    classes = EXCLUDED.classes
                """,
                (openid, name, other_props_txt, email, role.value, classes),
            )

    def get_user(self, openid: str) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                SELECT openid, name, other_properites, email, role, classes
                FROM users
                WHERE openid = %s
                """,
                (openid,),
            )
            row = cur.fetchone()
            if not row:
                return None
            other_props = self._maybe_json_load(row[2])
            return {
                "openid": row[0],
                "name": row[1],
                "other_properites": other_props,  # column name kept as-is
                "email": row[3],
                "role": row[4],
                "classes": row[5],
            }

    # -----------------------
    # Files
    # -----------------------
    def create_file(
        self,
        posted_user: Optional[str],
        file_name : str,
        file_role: FileRole,
        context: Optional[Any] = None,
    ) -> str:
        context_txt = self._maybe_json_dump(context)
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO files (posted_user, file_name, file_role, context)
                VALUES (%s, %s, %s, %s)
                RETURNING id
                """,
                (posted_user, file_name, file_role.value, context_txt),
            )
            (fid,) = cur.fetchone()
            return str(fid)

    def get_file(self, file_id: str) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                SELECT id, posted_user, file_name, file_role, context
                FROM files
                WHERE id = %s
                """,
                (file_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            ctx = self._maybe_json_load(row[3])
            return {
                "id": str(row[0]),
                "posted_user": str(row[1]) if row[1] else None,
                "file_name": str(row[2]),
                "file_role": row[3],
                "context": ctx,
            }

    def delete_file(self, file_id: str) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM files WHERE id = %s", (file_id,))
            return cur.rowcount > 0

    # -----------------------
    # File cache
    # -----------------------
    def set_file_cache(self, file_id: str, results: Any) -> None:
        results_txt = self._maybe_json_dump(results)
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
            return self._maybe_json_load(row[0])

    def delete_file_cache(self, file_id: str) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM file_cache WHERE id = %s", (file_id,))
            return cur.rowcount > 0

    # -----------------------
    # File task queue
    # -----------------------
    def enqueue_file_task(
        self,
        task_type: TaskType,
        files: List[str],
        prompt_info: Optional[Any] = None,
    ) -> int:
        prompt_txt = self._maybe_json_dump(prompt_info)
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO file_task (isRunning, task_type, prompt_info, files)
                VALUES (B'0', %s, %s, %s::uuid[])
                RETURNING id
                """,
                (task_type.value, prompt_txt, files),
            )
            (task_id,) = cur.fetchone()
            return int(task_id)

    def dequeue_file_task(self) -> Optional[Dict[str, Any]]:
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
                RETURNING ft.id, ft.task_type, ft.prompt_info, ft.files::uuid[]
                """
            )
            row = cur.fetchone()
            if not row:
                return None
            return {
                "id": int(row[0]),
                "task_type": int(row[1]),
                "prompt_info": self._maybe_json_load(row[2]),
                "files": row[3] or [],
            }

    def get_file_task(self, task_id: int) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                SELECT id, isRunning, task_type, prompt_info, files
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
                "isRunning": self._bit_to_bool(row[1]),
                "task_type": int(row[2]),
                "prompt_info": self._maybe_json_load(row[3]),
                "files": row[4] or [],
            }

    def list_file_tasks(
        self, running: Optional[bool] = None, limit: int = 100, offset: int = 0
    ) -> List[Dict[str, Any]]:
        where = ""
        if running is True:
            where = "WHERE isRunning = B'1'"
        elif running is False:
            where = "WHERE isRunning = B'0'"
        with self._conn_cur() as (_, cur):
            cur.execute(
                f"""
                SELECT id, isRunning, task_type, prompt_info, files
                FROM file_task
                {where}
                ORDER BY id
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            rows = cur.fetchall()
            out: List[Dict[str, Any]] = []
            for r in rows:
                out.append(
                    {
                        "id": int(r[0]),
                        "isRunning": self._bit_to_bool(r[1]),
                        "task_type": int(r[2]),
                        "prompt_info": self._maybe_json_load(r[3]),
                        "files": r[4] or [],
                    }
                )
            return out

    def complete_file_task(self, task_id: int) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM file_task WHERE id = %s", (task_id,))
            return cur.rowcount > 0

    def reset_file_task_to_queued(self, task_id: int) -> bool:
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

    def reset_all_file_running_to_queued(self) -> int:
        with self._conn_cur() as (_, cur):
            cur.execute(
                "UPDATE file_task SET isRunning = B'0' WHERE isRunning = B'1'"
            )
            return cur.rowcount

    # -----------------------
    # Text task queue (parity with file tasks)
    # -----------------------
    def enqueue_text_task(
        self,
        task_type: TaskType,
        texts: List[str],
        prompt_info: Optional[Any] = None,
    ) -> int:
        prompt_txt = self._maybe_json_dump(prompt_info)
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                INSERT INTO text_task (isRunning, task_type, prompt_info, texts)
                VALUES (B'0', %s, %s, %s)
                RETURNING id
                """,
                (task_type.value, prompt_txt, texts),
            )
            (task_id,) = cur.fetchone()
            return int(task_id)

    def dequeue_text_task(self) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                WITH cte AS (
                    SELECT id
                    FROM text_task
                    WHERE isRunning = B'0'
                    ORDER BY id
                    FOR UPDATE SKIP LOCKED
                    LIMIT 1
                )
                UPDATE text_task tt
                SET isRunning = B'1'
                FROM cte
                WHERE tt.id = cte.id
                RETURNING tt.id, tt.task_type, tt.prompt_info, tt.texts
                """
            )
            row = cur.fetchone()
            if not row:
                return None
            return {
                "id": int(row[0]),
                "task_type": int(row[1]),
                "prompt_info": self._maybe_json_load(row[2]),
                "texts": row[3] or [],
            }

    def get_text_task(self, task_id: int) -> Optional[Dict[str, Any]]:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                SELECT id, isRunning, task_type, prompt_info, texts
                FROM text_task
                WHERE id = %s
                """,
                (task_id,),
            )
            row = cur.fetchone()
            if not row:
                return None
            return {
                "id": int(row[0]),
                "isRunning": self._bit_to_bool(row[1]),
                "task_type": int(row[2]),
                "prompt_info": self._maybe_json_load(row[3]),
                "texts": row[4] or [],
            }

    def list_text_tasks(
        self, running: Optional[bool] = None, limit: int = 100, offset: int = 0
    ) -> List[Dict[str, Any]]:
        where = ""
        if running is True:
            where = "WHERE isRunning = B'1'"
        elif running is False:
            where = "WHERE isRunning = B'0'"
        with self._conn_cur() as (_, cur):
            cur.execute(
                f"""
                SELECT id, isRunning, task_type, prompt_info, texts
                FROM text_task
                {where}
                ORDER BY id
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            rows = cur.fetchall()
            out: List[Dict[str, Any]] = []
            for r in rows:
                out.append(
                    {
                        "id": int(r[0]),
                        "isRunning": self._bit_to_bool(r[1]),
                        "task_type": int(r[2]),
                        "prompt_info": self._maybe_json_load(r[3]),
                        "texts": r[4] or [],
                    }
                )
            return out

    def complete_text_task(self, task_id: int) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute("DELETE FROM text_task WHERE id = %s", (task_id,))
            return cur.rowcount > 0

    def reset_text_task_to_queued(self, task_id: int) -> bool:
        with self._conn_cur() as (_, cur):
            cur.execute(
                """
                UPDATE text_task
                SET isRunning = B'0'
                WHERE id = %s
                """,
                (task_id,),
            )
            return cur.rowcount > 0

    def reset_all_text_running_to_queued(self) -> int:
        with self._conn_cur() as (_, cur):
            cur.execute(
                "UPDATE text_task SET isRunning = B'0' WHERE isRunning = B'1'"
            )
            return cur.rowcount

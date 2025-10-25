import os
import psycopg2.pool
import enum
import json
from urllib.parse import urlparse


class EventStatus(enum.Enum):
    QUEUED = 0
    RUNNING = 1
    COMPLETE = 2


SCHEMA = """
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_status INT,
    event_payload TEXT,
    event_result TEXT
);
"""


class DB:
    def __init__(self) -> None:
        # Parse DATABASE_URL environment variable
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
            cur = con.cursor()
            cur.execute(SCHEMA)
            con.commit()
        finally:
            cur.close()
            self.pool.putconn(con)
    def get_all(self) -> list:
        con = self.pool.getconn()
        try:
            cur = con.cursor()
            cur.execute(
                """
                select * from events
                """,
            )
            return [
             row for row in cur.fetchall()
            ]

        finally:
            cur.close()
            self.pool.putconn(con)

    def enqueue_event(self, payload: dict) -> int:
        payload_json = json.dumps(payload)
        con = self.pool.getconn()
        try:
            cur = con.cursor()
            cur.execute(
                """
                INSERT INTO events(event_status, event_payload, event_result)
                VALUES (%s, %s, %s)
                RETURNING id;
                """,
                (EventStatus.QUEUED.value, payload_json, "{}"),
            )
            event_id = cur.fetchone()[0]
            con.commit()
            return event_id
        finally:
            cur.close()
            self.pool.putconn(con)

    def dequeue_event(self):
        con = self.pool.getconn()
        try:
            cur = con.cursor()
            cur.execute(
                """
                UPDATE events
                SET event_status = %s
                WHERE id = (
                    SELECT id FROM events
                    WHERE event_status = %s
                    ORDER BY id
                    LIMIT 1
                    FOR UPDATE SKIP LOCKED
                )
                RETURNING id, event_payload;
                """,
                (EventStatus.RUNNING.value, EventStatus.QUEUED.value),
            )
            row = cur.fetchone()
            con.commit()
            if not row:
                return None
            event_id, payload_json = row
            return event_id, json.loads(payload_json)
        finally:
            cur.close()
            self.pool.putconn(con)

    def complete_event(self, event_id: int, result: dict):
        result_json = json.dumps(result)
        con = self.pool.getconn()
        try:
            cur = con.cursor()
            cur.execute(
                """
                UPDATE events
                SET event_status = %s, event_result = %s
                WHERE id = %s;
                """,
                (EventStatus.COMPLETE.value, result_json, event_id),
            )
            con.commit()
        finally:
            cur.close()
            self.pool.putconn(con)

    def get_result(self, event_id: int):
        con = self.pool.getconn()
        try:
            cur = con.cursor()
            cur.execute("SELECT event_result FROM events WHERE id = %s;", (event_id,))
            row = cur.fetchone()
            print(row)
            if row:
                return json.loads(row[0])
            return None
        finally:
            cur.close()
            self.pool.putconn(con)

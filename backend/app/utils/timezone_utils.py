from datetime import datetime, timezone, timedelta
from typing import Optional

TIMEZONE = timezone(timedelta(hours=-3))


def now_utc_minus_3() -> datetime:
    return datetime.now(TIMEZONE)


def to_utc_minus_3(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TIMEZONE)
    return dt.astimezone(TIMEZONE)


def from_utc_to_local(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(TIMEZONE)


def to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TIMEZONE)
    return dt.astimezone(timezone.utc)


def parse_datetime_aware(dt_str: str) -> datetime:
    clean_str = dt_str.replace("Z", "").split("+")[0].split(".")[0]
    dt = datetime.fromisoformat(clean_str)
    return dt.replace(tzinfo=TIMEZONE)


def to_iso_string(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TIMEZONE)
    return dt.isoformat()


def to_input_datetime_local(dt: Optional[datetime]) -> str:
    if dt is None:
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=TIMEZONE)
    local_dt = dt.astimezone(TIMEZONE)
    return local_dt.strftime("%Y-%m-%dT%H:%M")

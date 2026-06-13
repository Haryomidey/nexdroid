from __future__ import annotations

from dataclasses import dataclass

@dataclass(frozen=True)
class CommandHistoryItem:
    id: int
    command: str
    created_at: str
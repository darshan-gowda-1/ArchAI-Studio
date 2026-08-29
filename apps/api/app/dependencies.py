"""
ArchAI Studio v3 - FastAPI Dependencies
"""

from typing import Generator, Dict, Any


# In-memory session store (backed by PostgreSQL in full production)
MEMORY_STORE: Dict[str, Any] = {
    "projects": {},
    "buildings": {},
    "jobs": {}
}


def get_db():
    """Yield database session."""
    yield MEMORY_STORE

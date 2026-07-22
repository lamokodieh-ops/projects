"""Demo materials shown only when the library is empty in mock mode."""

from __future__ import annotations

from db import create_material, list_materials
from llm_client import llm
from rag.ingest import chunk_text, normalize_text
from rag.store import MaterialStore

DEMO_MATERIALS = [
    {
        "title": "Demo - Cellular respiration (placeholder)",
        "text": """Cellular respiration converts glucose into usable energy (ATP).

Glycolysis occurs in the cytoplasm and breaks glucose into pyruvate.
The Krebs cycle (citric acid cycle) occurs in the mitochondrial matrix.
The electron transport chain sits on the inner mitochondrial membrane and produces most ATP.

Oxygen is the final electron acceptor in aerobic respiration.
Without oxygen, cells may use fermentation, which yields far less ATP.
""",
    },
    {
        "title": "Demo - Supply and demand (placeholder)",
        "text": """In a competitive market, price tends to settle where quantity supplied equals quantity demanded.

A demand curve slopes downward: as price rises, buyers want fewer units.
A supply curve slopes upward: as price rises, sellers offer more units.

A price ceiling below equilibrium can cause a shortage.
A price floor above equilibrium can cause a surplus.
Shifts in demand or supply change the equilibrium price and quantity.
""",
    },
]


def seed_mock_materials_if_empty() -> None:
    if llm.mode != "mock":
        return
    if list_materials():
        return

    for item in DEMO_MATERIALS:
        text = normalize_text(item["text"])
        chunks = chunk_text(text)
        material = create_material(
            title=item["title"],
            source_type="demo",
            filename=None,
            char_count=len(text),
            chunk_count=len(chunks),
        )
        vectors = llm.embed(chunks)
        MaterialStore(material["id"]).save(chunks, vectors)
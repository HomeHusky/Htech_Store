from app.services.hybrid_search import as_debug_rows


def test_as_debug_rows_shape() -> None:
    rows = [
        {"id": "p1", "semantic_rank": 2, "keyword_rank": 1, "search_score": 0.34},
        {"id": "p2", "semantic_rank": None, "keyword_rank": 2, "search_score": 0.12},
    ]
    out = as_debug_rows("product", rows)
    assert len(out) == 2
    assert out[0]["source_type"] == "product"
    assert out[0]["id"] == "p1"
    assert isinstance(out[0]["search_score"], float)

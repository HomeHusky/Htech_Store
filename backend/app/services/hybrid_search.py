from collections.abc import Sequence
from typing import Any, Literal

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.embeddings import embed_query, vector_literal


def _rows_to_dicts(rows: Sequence[Any]) -> list[dict[str, Any]]:
    return [dict(row._mapping) for row in rows]


def hybrid_search_products(
    db: Session, query: str, category: str | None = None, limit: int | None = None
) -> list[dict[str, Any]]:
    q_embedding = vector_literal(embed_query(query))
    result_limit = limit or settings.hybrid_limit
    sql = text(
        """
        WITH semantic AS (
          SELECT
            p.id,
            ROW_NUMBER() OVER (ORDER BY p.embedding <=> CAST(:q_embedding AS vector)) AS semantic_rank
          FROM products p
          WHERE p.embedding IS NOT NULL
            AND (CAST(:category AS text) IS NULL OR p.category::text = CAST(:category AS text))
          LIMIT :inner_limit
        ),
        keyword AS (
          SELECT
            p.id,
            ROW_NUMBER() OVER (
              ORDER BY ts_rank_cd(
                p.search_vector,
                websearch_to_tsquery('simple', :query)
              ) DESC
            ) AS keyword_rank
          FROM products p
          WHERE p.search_vector @@ websearch_to_tsquery('simple', :query)
            AND (CAST(:category AS text) IS NULL OR p.category::text = CAST(:category AS text))
          LIMIT :inner_limit
        ),
        fused AS (
          SELECT
            COALESCE(s.id, k.id) AS id,
            s.semantic_rank,
            k.keyword_rank,
            (COALESCE(1.0 / (:rrf_k + s.semantic_rank), 0.0) +
             COALESCE(1.0 / (:rrf_k + k.keyword_rank), 0.0)) AS search_score
          FROM semantic s
          FULL OUTER JOIN keyword k ON s.id = k.id
        )
        SELECT
          p.id, p.slug, p.name, p.brand, p.category, p.tagline, p.price, p.price_per_day, 
          p.image, p.available, p.discount, p.highlight_specs, p.details, p.is_new,
          p.stock, p.rating, p.review_count,
          f.semantic_rank, f.keyword_rank, f.search_score
        FROM fused f
        JOIN products p ON p.id = f.id
        ORDER BY f.search_score DESC
        LIMIT :result_limit
        """
    )
    rows = db.execute(
        sql,
        {
            "q_embedding": q_embedding,
            "query": query,
            "category": category,
            "rrf_k": settings.hybrid_rrf_k,
            "inner_limit": max(result_limit * 3, 24),
            "result_limit": result_limit,
        },
    ).fetchall()
    return _rows_to_dicts(rows)


def hybrid_search_policies(db: Session, query: str, limit: int | None = None) -> list[dict[str, Any]]:
    q_embedding = vector_literal(embed_query(query))
    result_limit = limit or settings.hybrid_limit
    sql = text(
        """
        WITH semantic AS (
          SELECT
            p.id,
            ROW_NUMBER() OVER (ORDER BY p.embedding <=> CAST(:q_embedding AS vector)) AS semantic_rank
          FROM store_policies p
          WHERE p.embedding IS NOT NULL
          LIMIT :inner_limit
        ),
        keyword AS (
          SELECT
            p.id,
            ROW_NUMBER() OVER (
              ORDER BY ts_rank_cd(
                p.search_vector,
                websearch_to_tsquery('simple', :query)
              ) DESC
            ) AS keyword_rank
          FROM store_policies p
          WHERE p.search_vector @@ websearch_to_tsquery('simple', :query)
          LIMIT :inner_limit
        ),
        fused AS (
          SELECT
            COALESCE(s.id, k.id) AS id,
            s.semantic_rank,
            k.keyword_rank,
            (COALESCE(1.0 / (:rrf_k + s.semantic_rank), 0.0) +
             COALESCE(1.0 / (:rrf_k + k.keyword_rank), 0.0)) AS search_score
          FROM semantic s
          FULL OUTER JOIN keyword k ON s.id = k.id
        )
        SELECT
          p.id, p.policy_type, p.locale, p.title, p.content,
          f.semantic_rank, f.keyword_rank, f.search_score
        FROM fused f
        JOIN store_policies p ON p.id = f.id
        ORDER BY f.search_score DESC
        LIMIT :result_limit
        """
    )
    rows = db.execute(
        sql,
        {
            "q_embedding": q_embedding,
            "query": query,
            "rrf_k": settings.hybrid_rrf_k,
            "inner_limit": max(result_limit * 3, 24),
            "result_limit": result_limit,
        },
    ).fetchall()
    return _rows_to_dicts(rows)


def as_debug_rows(
    source_type: Literal["product", "policy"], rows: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    return [
        {
            "source_type": source_type,
            "id": row["id"],
            "semantic_rank": row.get("semantic_rank"),
            "keyword_rank": row.get("keyword_rank"),
            "search_score": float(row["search_score"]),
        }
        for row in rows
    ]

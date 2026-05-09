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
    result_limit = limit or settings.hybrid_limit
    try:
        q_embedding = vector_literal(embed_query(query))
    except Exception:
        return _fallback_product_search(db, query, category, result_limit)

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
          p.id, p.slug, p.name, p.category, p.price, p.is_trade_in,
          p.image, p.available, p.discount, p.details,
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
    results = _rows_to_dicts(rows)
    return results or _fallback_product_search(db, query, category, result_limit)


def hybrid_search_policies(db: Session, query: str, limit: int | None = None) -> list[dict[str, Any]]:
    result_limit = limit or settings.hybrid_limit
    try:
        q_embedding = vector_literal(embed_query(query))
    except Exception:
        return _fallback_policy_search(db, query, result_limit)

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
    results = _rows_to_dicts(rows)
    return results or _fallback_policy_search(db, query, result_limit)


def _fallback_product_search(
    db: Session, query: str, category: str | None, result_limit: int
) -> list[dict[str, Any]]:
    sql = text(
        """
        SELECT
          p.id, p.slug, p.name, p.category, p.price, p.is_trade_in,
          p.image, p.available, p.discount, p.details,
          NULL::integer AS semantic_rank,
          NULL::integer AS keyword_rank,
          0.01::float AS search_score
        FROM products p
        WHERE p.available = true
          AND (CAST(:category AS text) IS NULL OR p.category::text = CAST(:category AS text))
          AND (
            CAST(p.name AS text) ILIKE :needle
            OR p.slug ILIKE :needle
            OR p.category::text ILIKE :needle
            OR CAST(p.details AS text) ILIKE :needle
          )
        ORDER BY p.discount DESC, p.price ASC
        LIMIT :result_limit
        """
    )
    rows = db.execute(
        sql,
        {"needle": f"%{query}%", "category": category, "result_limit": result_limit},
    ).fetchall()
    results = _rows_to_dicts(rows)
    if results:
        return results

    rows = db.execute(
        text(
            """
            SELECT
              p.id, p.slug, p.name, p.category, p.price, p.is_trade_in,
              p.image, p.available, p.discount, p.details,
              NULL::integer AS semantic_rank,
              NULL::integer AS keyword_rank,
              0.001::float AS search_score
            FROM products p
            WHERE p.available = true
              AND (CAST(:category AS text) IS NULL OR p.category::text = CAST(:category AS text))
            ORDER BY p.discount DESC, p.price ASC
            LIMIT :result_limit
            """
        ),
        {"category": category, "result_limit": result_limit},
    ).fetchall()
    return _rows_to_dicts(rows)


def _fallback_policy_search(db: Session, query: str, result_limit: int) -> list[dict[str, Any]]:
    sql = text(
        """
        SELECT
          p.id, p.policy_type, p.locale, p.title, p.content,
          NULL::integer AS semantic_rank,
          NULL::integer AS keyword_rank,
          0.01::float AS search_score
        FROM store_policies p
        WHERE CAST(p.title AS text) ILIKE :needle
           OR p.content ILIKE :needle
           OR p.policy_type ILIKE :needle
        ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC NULLS LAST
        LIMIT :result_limit
        """
    )
    rows = db.execute(sql, {"needle": f"%{query}%", "result_limit": result_limit}).fetchall()
    results = _rows_to_dicts(rows)
    if results:
        return results

    rows = db.execute(
        text(
            """
            SELECT
              p.id, p.policy_type, p.locale, p.title, p.content,
              NULL::integer AS semantic_rank,
              NULL::integer AS keyword_rank,
              0.001::float AS search_score
            FROM store_policies p
            ORDER BY p.updated_at DESC NULLS LAST, p.created_at DESC NULLS LAST
            LIMIT :result_limit
            """
        ),
        {"result_limit": result_limit},
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

# Admin Filters And Sorting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consistent filters and clickable column sorting across admin list pages, with products defaulting to newest created first.

**Architecture:** Keep filtering and sorting client-side for current admin datasets. Expose missing `created_at` fields from backend DTOs only where the UI needs them. Use a small frontend helper module for reusable sort state, date parsing, and table header buttons.

**Tech Stack:** FastAPI/Pydantic backend, Next.js React client pages, TypeScript, Tailwind, lucide-react.

---

### Task 1: Backend DTO Created Timestamps

**Files:**
- Modify: `backend/app/schemas/admin.py`
- Modify: `backend/app/api/admin.py`

- [ ] Add optional `created_at` to `ProductDTO` and `OrderDTO`.
- [ ] Populate `created_at` in admin product/order responses from SQLAlchemy model timestamps.

### Task 2: Shared Admin Sort Utilities

**Files:**
- Create: `frontend/lib/admin-list.tsx`

- [ ] Add `SortDirection`, `SortState`, `toggleSort`, `compareValues`, `sortRows`, `formatAdminDate`, and `SortableTh`.
- [ ] Keep UI styling consistent with existing admin table headers.

### Task 3: Products Admin

**Files:**
- Modify: `frontend/lib/products-api.ts`
- Modify: `frontend/app/admin/products/page.tsx`

- [ ] Add `created_at` to `ProductDTO`.
- [ ] Add category/status/stock filters.
- [ ] Add created column and default sort by `created_at` descending.
- [ ] Convert sortable columns to `SortableTh`.

### Task 4: Other Admin Lists

**Files:**
- Modify: `frontend/app/admin/orders/page.tsx`
- Modify: `frontend/app/admin/inventory/page.tsx`
- Modify: `frontend/app/admin/repairs/page.tsx`
- Modify: `frontend/app/admin/customers/page.tsx`
- Modify: `frontend/app/admin/promotions/page.tsx`
- Modify: `frontend/app/admin/categories/page.tsx`

- [ ] Add missing search/filter controls where useful.
- [ ] Add clickable sorting to tables and card/list pages where the data is list-like.
- [ ] Preserve existing layouts for configuration pages.

### Task 5: Verification

**Files:**
- No production files.

- [ ] Run GitNexus detect changes.
- [ ] Run available frontend/backend static checks or tests; report blockers if dependencies are missing.
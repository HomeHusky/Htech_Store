# Admin AI Product Image Import Design

Date: 2026-05-14

## Goal

Admin users can create products from image groups. Each upload row represents exactly one new product, and each row can contain multiple images of that product. The system persists AI-created products immediately, marks them as needing admin review, streams progress during creation, and keeps those review items visible until an admin confirms or ignores them.

## Confirmed Decisions

- One upload row creates one product.
- Each product can have multiple images.
- AI-created products are saved to the main `products` table.
- AI-created products must not be sellable until reviewed.
- Admin can leave generated products pending and return later.
- The implementation should use an explicit AI review status field, not only JSON metadata.

## Data Model

Add a string field on `products`:

- `ai_status`: one of `manual`, `pending_review`, `confirmed`, `ignored`.

Defaults:

- Existing and manually created products use `manual`.
- AI-created products use `pending_review`.
- AI-created products are created with `available=false`.

AI output metadata is also stored in `details`:

- `ai_generated: true`
- `ai_confidence: number`
- `ai_notes: string[]`
- `ai_source_images: string[]`

This keeps the product queryable by review status while preserving the model reasoning notes for admins.

## Backend API

Add a streaming endpoint:

`POST /api/admin/products/ai-create/stream`

Request:

- `multipart/form-data`
- `rows`: JSON array describing row IDs and optional admin hints such as category.
- Image files are grouped by row ID using form field names such as `files:<rowId>`.

Response:

- `StreamingResponse`
- Content type: `application/x-ndjson`
- Each line is one JSON event.

Event types:

- `received`: backend accepted the batch.
- `uploading`: row images are being saved.
- `uploaded`: row images were saved and URLs are available.
- `analyzing`: LLM vision analysis started for a row.
- `creating`: product payload is being normalized and saved.
- `created`: product was saved and returned as `ProductDTO`.
- `failed`: a row failed; other rows continue.
- `done`: batch complete with counts.

Add review actions:

- `PATCH /api/admin/products/{product_id}/ai-status`
- Allows `confirmed` or `ignored`.
- Confirming does not automatically set `available=true`; admin still controls sellable status through the existing edit flow.

## AI Vision Service

Create a dedicated backend service for product extraction from images. It should not be mixed into the customer sales chat agent.

Responsibilities:

- Accept image URLs and local image bytes for a single product row.
- Call the configured admin model when it supports image input.
- Prefer Gemini or OpenAI vision-capable models.
- Ask the model to return strict JSON matching the product creation fields.
- Normalize the JSON into `ProductDTO`.
- Fill conservative defaults when AI is uncertain:
  - `available=false`
  - `stock=0`
  - `rating=5`
  - `reviewCount=0`
  - `discountPercent=0`
- Include confidence and notes in `details`.

If the configured provider/model does not support vision or is missing credentials, the row returns a `failed` stream event with a clear admin-facing message.

## Frontend UI

Update `/admin/products`:

- Add a `Them bang AI` button beside manual product creation.
- Open an AI import modal.
- Modal contains editable rows; each row accepts multiple images.
- Admin can add or remove rows before starting.
- When started, the modal streams progress using `fetch` and `ReadableStream`.
- Each row shows its current state, image count, created product name, or error.
- After completion, the modal shows the products created by AI and links them to the normal edit modal.

Product list changes:

- Add a filter for `AI cho xac nhan`.
- Show a badge for products with `ai_status="pending_review"`.
- Add row actions:
  - `Xac nhan`: marks `ai_status="confirmed"`.
  - `Bo qua`: marks `ai_status="ignored"`.
- Pending products remain visible across sessions until confirmed or ignored.

## Error Handling

- Each row is isolated; one failed row does not stop the batch.
- File upload failures emit `failed` for that row.
- LLM parsing failures emit `failed` with the raw issue summarized.
- Duplicate slug conflicts are handled by suffixing the slug.
- Missing or uncertain values are saved as review notes instead of blocking creation.

## Testing

Backend:

- Unit test AI JSON normalization into a valid `ProductDTO`.
- Unit test AI product persistence with `ai_status="pending_review"` and `available=false`.
- Unit test stream event formatting for success and failure rows.

Frontend:

- Type-check/build the admin products page.
- Verify the modal can build grouped `FormData`.
- Verify streamed NDJSON events update row states.

## Rollout Notes

- Existing products migrate to `ai_status="manual"`.
- No existing product should become unavailable due to the migration.
- The change is additive except for admin product DTOs and product list rendering.

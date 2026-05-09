## Table `ai_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `chat_provider` | `varchar` |  |
| `chat_model` | `varchar` |  |
| `embedding_provider` | `varchar` |  |
| `embedding_model` | `varchar` |  |
| `updated_at` | `timestamptz` |  |
| `google_client_id` | `varchar` |  Nullable |
| `google_client_secret` | `varchar` |  Nullable |
| `database_url` | `varchar` |  Nullable |
| `system_prompt` | `text` |  Nullable |
| `telegram_bot_token` | `varchar` |  Nullable |
| `telegram_chat_id` | `varchar` |  Nullable |

## Table `alembic_version`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `version_num` | `varchar` | Primary |

## Table `categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `slug` | `varchar` |  Unique |
| `name` | `json` |  |
| `parent_id` | `varchar` |  Nullable |

## Table `order_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `order_id` | `varchar` |  |
| `product_id` | `varchar` |  |
| `qty` | `int4` |  |
| `price` | `int4` |  |
| `days` | `int4` |  Nullable |
| `warranty_expiry` | `date` |  Nullable |

## Table `orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `order_number` | `varchar` |  |
| `customer` | `varchar` |  |
| `email` | `varchar` |  |
| `phone` | `varchar` |  |
| `shipping_address` | `text` |  Nullable |
| `voucher_id` | `varchar` |  Nullable |
| `total` | `int4` |  |
| `deposit` | `int4` |  |
| `payment_method` | `varchar` |  |
| `payment_status` | `varchar` |  |
| `status` | `order_status` |  |
| `event_date` | `date` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `user_id` | `varchar` |  Nullable |
| `payment_proof` | `varchar` |  Nullable |

## Table `products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `slug` | `varchar` |  |
| `sku` | `varchar` |  Unique, Nullable |
| `name` | `json` |  |
| `category` | `varchar` |  |
| `price` | `int4` |  |
| `price_per_day` | `bool` |  |
| `image` | `varchar` |  |
| `gallery` | `json` |  |
| `description` | `json` |  |
| `details` | `json` |  |
| `available` | `bool` |  |
| `trending` | `bool` |  |
| `discount` | `int4` |  |
| `embedding` | `vector` |  Nullable |
| `search_vector` | `tsvector` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `brand` | `varchar` |  Nullable |
| `tagline` | `json` |  Nullable |
| `highlight_specs` | `json` |  Nullable |
| `is_new` | `bool` |  Nullable |
| `stock` | `int4` |  Nullable |
| `rating` | `int4` |  Nullable |
| `review_count` | `int4` |  Nullable |

## Table `product_variants`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `product_id` | `varchar` |  |
| `sku` | `varchar` |  Unique |
| `name` | `varchar` |  |
| `attributes` | `jsonb` |  |
| `price` | `int4` |  |
| `stock` | `int4` |  |
| `is_default` | `bool` |  |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `product_attributes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `product_id` | `varchar` |  |
| `attr_key` | `varchar` |  |
| `attr_label` | `varchar` |  |
| `attr_value` | `text` |  |
| `unit` | `varchar` |  Nullable |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `product_reviews`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `product_id` | `varchar` |  |
| `user_id` | `varchar` |  Nullable |
| `rating` | `int4` |  |
| `comment` | `text` |  |
| `images` | `json` |  |
| `locale` | `varchar` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `faqs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `locale` | `varchar` |  |
| `question` | `text` |  |
| `answer` | `text` |  |
| `sort_order` | `int4` |  |
| `active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `chat_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `user_id` | `varchar` |  Nullable |
| `locale` | `varchar` |  |
| `session_meta` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `chat_history`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `session_id` | `varchar` |  |
| `user_id` | `varchar` |  Nullable |
| `role` | `varchar` |  |
| `message` | `text` |  |
| `metadata` | `jsonb` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `repair_notes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `repair_id` | `varchar` |  |
| `content` | `text` |  |
| `created_at` | `timestamptz` |  |

## Table `repairs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `customer_name` | `varchar` |  |
| `device_name` | `varchar` |  |
| `issue` | `text` |  |
| `status` | `repair_status` |  |
| `created_at` | `timestamptz` |  |

## Table `store_policies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `policy_type` | `varchar` |  |
| `locale` | `varchar` |  |
| `title` | `varchar` |  Nullable |
| `content` | `text` |  |
| `embedding` | `vector` |  Nullable |
| `search_vector` | `tsvector` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `vouchers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `code` | `varchar` |  Unique |
| `discount_percent` | `int4` |  |
| `active` | `bool` |  |
| `min_order_value` | `int4` |  |
| `max_discount_amount` | `int4` |  |
| `expires_at` | `timestamptz` |  Nullable |

## Table `store_profile`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `name` | `varchar` |  |
| `address` | `varchar` |  |
| `email` | `varchar` |  |
| `bank_name` | `varchar` |  |
| `bank_account` | `varchar` |  |
| `bank_beneficiary` | `varchar` |  |
| `updated_at` | `timestamptz` |  |
| `facebook_link` | `varchar` |  Nullable |
| `instagram_link` | `varchar` |  Nullable |

## Table `store_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `deposit_percentage` | `int4` |  |
| `updated_at` | `timestamptz` |  |

## Table `theme_palettes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `varchar` |  |
| `is_preset` | `bool` |  |
| `light_main` | `varchar` |  |
| `light_sub` | `varchar` |  |
| `light_accent` | `varchar` |  |
| `dark_main` | `varchar` |  |
| `dark_sub` | `varchar` |  |
| `dark_accent` | `varchar` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `theme_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `active_palette_id` | `varchar` |  Nullable |
| `updated_at` | `timestamptz` |  |
| `hero_image_url` | `varchar` |  Nullable |
| `deposit_percent` | `int4` |  Nullable |
| `hero_title` | `varchar` |  Nullable |
| `hero_subtitle` | `varchar` |  Nullable |
| `hero_badge` | `varchar` |  Nullable |
| `hero_layout` | `varchar` |  Nullable |
| `hero_images` | `jsonb` |  Nullable |
| `hero_bg_image_url` | `varchar` |  Nullable |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `email` | `varchar` |  |
| `username` | `varchar` |  |
| `hashed_password` | `varchar` |  Nullable |
| `full_name` | `varchar` |  Nullable |
| `role` | `user_role` |  |
| `permission` | `user_permission` |  |
| `google_id` | `varchar` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `vouchers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `code` | `varchar` |  |
| `discount_percent` | `int4` |  |
| `active` | `bool` |  |
| `expires_at` | `timestamptz` |  Nullable |


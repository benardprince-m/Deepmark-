# DeepMark API Specification

## Base URL

```
Production: https://deepmark.app/api/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All endpoints (except auth) require:
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Endpoints

### Authentication

#### POST /auth/signup
Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "token": "jwt_token"
  }
}
```

#### POST /auth/login
Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "token": "jwt_token"
  }
}
```

#### GET /auth/me
Get current user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Campaigns

#### GET /campaigns
List all campaigns for user.

**Query params:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "campaigns": [...],
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

#### POST /campaigns
Create new campaign.

**Request:**
```json
{
  "name": "Summer Launch",
  "goal": "brand_awareness",
  "channels": ["linkedin", "twitter"],
  "start_date": "2026-09-01",
  "end_date": "2026-09-30"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Summer Launch",
    ...
  }
}
```

#### GET /campaigns/:id
Get campaign by ID.

#### PUT /campaigns/:id
Update campaign.

#### DELETE /campaigns/:id
Delete campaign.

### Content

#### GET /content
List all content.

**Query params:**
- `campaign_id` (optional): Filter by campaign
- `status` (optional): draft | scheduled | published

#### POST /content
Create new content.

**Request:**
```json
{
  "campaign_id": "uuid",
  "type": "linkedin_post",
  "platform": "linkedin",
  "content": "Generated content text...",
  "scheduled_at": "2026-09-15T10:00:00Z"
}
```

#### PUT /content/:id
Update content.

#### DELETE /content/:id
Delete content.

### Studio (AI Generation)

#### POST /studio/generate
Generate content using AI.

**Request:**
```json
{
  "content_type": "linkedin_post",
  "topic": "Product launch announcement",
  "tone": "professional",
  "audience": "early-stage founders",
  "additional_context": "We're launching next week"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Generated LinkedIn post...",
    "platform": "linkedin",
    "character_count": 2850,
    "tokens_used": 1500
  }
}
```

#### POST /studio/enhance
Enhance existing content.

**Request:**
```json
{
  "content": "Original content...",
  "action": "improve_hook",
  "platform": "linkedin"
}
```

### Analytics

#### GET /analytics/overview
Get analytics overview.

**Query params:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": {
    "total_reach": 50000,
    "total_engagement": 2500,
    "new_followers": 150,
    "conversions": 25,
    "top_performing": [...]
  }
}
```

### Integrations

#### POST /integrations/:workspace_id/connect
Connect a social account.

**Request:**
```json
{
  "platform": "linkedin",
  "access_token": "oauth_token"
}
```

#### DELETE /integrations/:id
Disconnect integration.

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing JWT token |
| `FORBIDDEN` | User doesn't have permission |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/*` | 10/minute |
| `/studio/*` | 20/minute |
| All others | 100/minute |

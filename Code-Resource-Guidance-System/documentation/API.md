# CRGS API Quick Reference

All API requests use JSON. Protected endpoints require:
`Authorization: Bearer <token>`

## Auth
- `POST /api/auth/register` — `{name,email,password}`
- `POST /api/auth/login` — `{email,password}`
- `GET /api/auth/me` — current authenticated user

## Resources
- `GET /api/resources?search=&language=&level=&type=` — list and filter
- `GET /api/resources/:id` — detail
- `POST /api/resources` — admin creates
- `PUT /api/resources/:id` — admin updates
- `DELETE /api/resources/:id` — admin deletes

Resource fields: `title`, `description`, `url`, `language`, `topic`, `level`, `type`, `tags`.

## Bookmarks
- `GET /api/bookmarks` — list current user's saved items
- `POST /api/bookmarks/:resourceId` — save
- `DELETE /api/bookmarks/:resourceId` — remove

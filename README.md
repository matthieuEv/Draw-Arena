# Draw-Arena

> A E4A project by Maxime, Maxence, Julien and Timat

## Demo stack

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000/api`
- MariaDB: `localhost:3306` (db: `drawarena`, user/pass: `drawarena`)

## Devcontainer

The devcontainer spins up frontend, backend, and database together.

```bash
docker compose -f .devcontainer/docker-compose.yml up --build
```

To test if the API is working, you can run this command:

```
curl  http://localhost:8000/api/health
```

If it's returning `{"status":"ok"}`, then the backend is working fine.

Then open `http://localhost:8080` and use the register/login flow to post.

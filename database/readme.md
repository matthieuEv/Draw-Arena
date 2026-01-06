# Database | Draw-Arena

This project uses MariaDB 10.8 and is started via the devcontainer
Docker Compose stack.

## Connect from inside the container

When the Docker Compose stack is running, you can use this command to
open a MariaDB shell inside the database container:

```bash
docker exec -it draw-arena-db mariadb -u drawarena -pdrawarena drawarena
```

You can also connect as root:

```bash
docker exec -it draw-arena-db mariadb -u root -proot
```

## Useful SQL commands

```sql
SHOW DATABASES;
USE drawarena;
SHOW TABLES;
DESCRIBE users;
DESCRIBE posts;
DESCRIBE tokens;

SELECT * FROM users;
SELECT * FROM posts ORDER BY created_at DESC;
SELECT * FROM tokens;

SELECT posts.id, posts.title, posts.body, users.username
FROM posts
JOIN users ON users.id = posts.user_id
ORDER BY posts.created_at DESC;
```

## Reset data (optional)

```sql
TRUNCATE TABLE tokens;
TRUNCATE TABLE posts;
TRUNCATE TABLE users;
```

## Schema source

The schema is initialized from `database/init.sql` when the container is
created.

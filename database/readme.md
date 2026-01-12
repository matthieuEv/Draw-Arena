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

## Insert test data

To populate the database with test data, run:

```bash
docker exec -i draw-arena-db mariadb -u drawarena -pdrawarena drawarena < database/insertion.sql
```

This will insert:
- A test user (username: `user`, password: `verybigpassword1`)
- A sample post

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

## Connect to Azure MySQL (Production & Preprod)

### Get connection information

For **production**:

```bash
terraform -chdir=infra workspace select prod
echo "MYSQL_HOST_PROD=$(terraform -chdir=infra output -raw mysql_server_fqdn)"
echo "MYSQL_USER_PROD=$(terraform -chdir=infra output -raw mysql_admin_user)"
echo "MYSQL_DATABASE_PROD=$(terraform -chdir=infra output -raw mysql_database_name)"
```

For **preprod**:

```bash
terraform -chdir=infra workspace select preprod
echo "MYSQL_HOST_PREPROD=$(terraform -chdir=infra output -raw mysql_server_fqdn)"
echo "MYSQL_USER_PREPROD=$(terraform -chdir=infra output -raw mysql_admin_user)"
echo "MYSQL_DATABASE_PREPROD=$(terraform -chdir=infra output -raw mysql_database_name)"
```

### Connect with MySQL client

Once you have the credentials, connect using:

```bash
mysql -h <MYSQL_HOST> -u <MYSQL_USER> -p<MYSQL_PASSWORD> <MYSQL_DATABASE>
```

Example for production:

```bash
mysql -h draw-arena-mysql-prod.mysql.database.azure.com -u drawarena -p drawarena
```

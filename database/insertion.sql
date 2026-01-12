insert into users (username, password_hash) values ('user', '$2y$10$bojNdcPNbpU8Cv6v9FXcxumADxk9KDLw5ijQT3exaekkRgQB6V7TW'); -- verybigpassword1

insert into posts (id, user_id, title, body, image_url, created_at) values (1, 1, 'First Post', 'This is the content of the first post.', NULL, '2024-01-01 10:00:00');

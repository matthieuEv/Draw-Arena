-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all existing data
TRUNCATE TABLE tokens;
TRUNCATE TABLE posts;
TRUNCATE TABLE users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample data
INSERT INTO users (username, password_hash) VALUES ('user', '$2y$10$bojNdcPNbpU8Cv6v9FXcxumADxk9KDLw5ijQT3exaekkRgQB6V7TW'); -- verybigpassword1

INSERT INTO posts (id, user_id, title, body, image_url, created_at) VALUES (1, 1, 'First Post', 'This is the content of the first post.', NULL, '2024-01-01 10:00:00');

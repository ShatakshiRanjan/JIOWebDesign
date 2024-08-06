CREATE DATABASE  IF NOT EXISTS `Taskify`;
USE `Taskify`;

#Drop tables if they exist (optional)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS task_assignments;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS archieved_posts;

-- #Create users table
-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     email VARCHAR(255) NOT NULL,
--     first_name VARCHAR(100) NOT NULL,
--     last_name VARCHAR(100) NOT NULL,
--     passw VARCHAR(255) NOT NULL
-- );

#Create projects table
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

#Insert the General project
INSERT INTO projects (name, description, user_id) VALUES ('General', 'Default project for tasks without a specific project', NULL);

#Create tasks table
CREATE TABLE tasks (
    TID INT AUTO_INCREMENT PRIMARY KEY,
    task TEXT NOT NULL,
    type ENUM('event', 'task') NOT NULL,
    dateOfTaskStart DATE NULL,
    timeOfTaskStart TIME NULL,
    dateOfTaskEnd DATE NULL,
    timeOfTaskEnd TIME NULL,
    dueDate DATE NULL,
    dueTime TIME NULL,
    descript TEXT NOT NULL,
    user_id INT,
    project_id INT,
    completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- #Create task_assignments table
-- CREATE TABLE task_assignments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     task_id INT NOT NULL,
--     user_id INT NOT NULL,
--     FOREIGN KEY (task_id) REFERENCES tasks(TID),
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- #Create posts table
-- CREATE TABLE posts (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     title VARCHAR(255) NOT NULL,
--     body TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
-- 	   post_id INT NULL,
--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );

#Create archieved posts table
-- CREATE TABLE archieved_posts (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_id INT NOT NULL,
--     title VARCHAR(255) NOT NULL,
--     body TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

--     FOREIGN KEY (user_id) REFERENCES users(id)
-- );

-- #Create comments table
-- CREATE TABLE comments (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     post_id INT NOT NULL,
--     user_id INT NOT NULL,
--     body TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     archieved BOOL DEFAULT FALSE,
-- 	   archieved_id INT NULL,
--     FOREIGN KEY (post_id) REFERENCES posts(id),
--     FOREIGN KEY (user_id) REFERENCES users(id),
-- 	   FOREIGN KEY (archieved_id) REFERENCES archieved_posts(id)
-- );

call taskify.archieving_posts();
select * from posts;
select * from comments;
select * from task_assignments;
select * from tasks;
select * from users;
select * from archieved_posts;

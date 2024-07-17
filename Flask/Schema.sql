CREATE DATABASE  IF NOT EXISTS `Taskify`;
USE `Taskify`;

#Drop tables if they exist (optional)
DROP TABLE IF EXISTS task_assignments;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

#Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    passw VARCHAR(255) NOT NULL
);

#Create tasks table
CREATE TABLE tasks (
    TID INT AUTO_INCREMENT PRIMARY KEY,
    task TEXT NOT NULL,
    dateOfTaskStart DATE NOT NULL,
    timeOfTaskStart TIME NOT NULL,
    dateOfTaskEnd DATE NOT NULL,
    timeOfTaskEnd TIME NOT NULL,
    descript TEXT NOT NULL,
    user_id INT,
    completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP NULL DEFAULT NULL
);

#Create task_assignments table
CREATE TABLE task_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(TID),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

select * from task_assignments;
select * from tasks;
select * from users;
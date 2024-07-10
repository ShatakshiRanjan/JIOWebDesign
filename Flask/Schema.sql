-- Database 
CREATE DATABASE  IF NOT EXISTS `Taskify`
USE `Taskify`;

-- Drop tables if they exist (optional)
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    passw VARCHAR(255) NOT NULL
);

-- Create tasks table
CREATE TABLE tasks (
    TID INT AUTO_INCREMENT PRIMARY KEY,
    task TEXT NOT NULL,
    dateOfTaskStart DATE NOT NULL,
    dateOfTaskEnd DATE NOT NULL,
    dedicatedTo INT NOT NULL,
    descript TEXT NOT NULL,
    FOREIGN KEY (dedicatedTo) REFERENCES users(id)
);

ALTER TABLE tasks ADD COLUMN user_id INT;

select * from tasks;
select * from users;


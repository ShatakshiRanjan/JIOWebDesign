-- Database 
#CREATE DATABASE  IF NOT EXISTS `Taskify`
#USE `Taskify`;

-- Drop tables if they exist (optional)
#DROP TABLE IF EXISTS users;
#DROP TABLE IF EXISTS tasks;

-- Create users table
#CREATE TABLE users (
#    id INT AUTO_INCREMENT PRIMARY KEY,
#    email VARCHAR(255) NOT NULL,
#    first_name VARCHAR(100) NOT NULL,
#    last_name VARCHAR(100) NOT NULL,
#    passw VARCHAR(255) NOT NULL
#);

-- Create tasks table
#CREATE TABLE tasks (
#    TID INT AUTO_INCREMENT PRIMARY KEY,
#    task TEXT NOT NULL,
#    dateOfTaskStart DATETIME NOT NULL,
#    dateOfTaskEnd DATETIME NOT NULL
#);

select email, passw from users;

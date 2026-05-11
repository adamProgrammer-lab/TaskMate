CREATE DATABASE IF NOT EXISTS taskmate
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskmate;

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority ENUM('alta', 'media', 'baja') DEFAULT 'media',
  category VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

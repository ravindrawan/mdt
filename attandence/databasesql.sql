CREATE DATABASE IF NOT EXISTS mdtu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mdtu_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (username, password, role) VALUES 
('admin', '123', 'admin'),
('superadmin', '123', 'super'),
('officer', '123', 'superuser')
ON DUPLICATE KEY UPDATE username=username;

-- Training Records Table
CREATE TABLE IF NOT EXISTS training_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    nic VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    office VARCHAR(255) NOT NULL,
    trainingName VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    hours INT NOT NULL,
    foodRating INT,
    coordinationRating INT,
    feedback TEXT,
    lecturerEvals TEXT,
    absentDates VARCHAR(255),
    confirmed TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Progress Submissions Table (Updated)
CREATE TABLE IF NOT EXISTS progress_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    userId VARCHAR(50) NOT NULL,
    office VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    month VARCHAR(50) NOT NULL,
    specialRemarks TEXT,
    productivityTasks TEXT,
    otherTrainings TEXT,
    pdfAttachment LONGTEXT,
    submittedAt DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Training Plans Table
CREATE TABLE IF NOT EXISTS training_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    userId VARCHAR(50) NOT NULL,
    office VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    reqGeneral TEXT,
    specialized TEXT,
    departmental TEXT,
    obt TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
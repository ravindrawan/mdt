-- MDTU NWP Training Management System - full database schema
-- You can import this file in phpMyAdmin, but it is optional:
-- db.php creates all tables and the default users automatically on first use.
-- Default logins (created automatically): admin / 123, superadmin / 123, officer / 123
-- The system forces a new password at the first login with these defaults.
--
-- Importing manually: first select your database in phpMyAdmin (on SLT/cPanel e.g. "account_mdtu"), then Import.
-- Local XAMPP only: you may create the database first with
--   CREATE DATABASE IF NOT EXISTS mdtu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Login accounts (passwords are stored as secure hashes)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    mustChangePassword TINYINT(1) NOT NULL DEFAULT 0,
    passwordChangedAt DATETIME NULL,
    lastLoginAt DATETIME NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Training programs with venue, dates and resource persons
CREATE TABLE IF NOT EXISTS programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    fileNo VARCHAR(100) NULL,
    dates TEXT NOT NULL,
    firstDate DATE NOT NULL,
    hours INT NOT NULL DEFAULT 6,
    resourcePersons TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_program_name_date (name(191), firstDate),
    KEY idx_program_first_date (firstDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Officer directory (auto-fill by NIC)
CREATE TABLE IF NOT EXISTS officers (
    nic VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    office VARCHAR(255),
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance / training records (one row per officer per program)
CREATE TABLE IF NOT EXISTS training_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    programId INT NULL,
    nic VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    office VARCHAR(255) NOT NULL,
    trainingName VARCHAR(255) NOT NULL,
    venue VARCHAR(255),
    date DATE NOT NULL,
    hours INT NOT NULL,
    foodRating INT,
    coordinationRating INT,
    feedback TEXT,
    lecturerEvals TEXT,
    absentDates VARCHAR(255),
    confirmed TINYINT(1) NOT NULL DEFAULT 0,
    confirmedBy VARCHAR(100),
    confirmedAt DATETIME,
    certSerial VARCHAR(40),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cert_serial (certSerial),
    UNIQUE KEY uq_attendance (nic, trainingName(191), date),
    KEY idx_records_year (year),
    KEY idx_records_nic (nic),
    KEY idx_records_program (programId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monthly progress submissions by superusers
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
    submittedAt DATETIME,
    KEY idx_progress_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Annual training plans / training needs
CREATE TABLE IF NOT EXISTS training_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    userId VARCHAR(50) NOT NULL,
    office VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    reqGeneral TEXT,
    specialized TEXT,
    departmental TEXT,
    obt TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_plans_year (year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Office cadre strength by designation (per year)
CREATE TABLE IF NOT EXISTS staff_matrix (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    office VARCHAR(255) NOT NULL,
    counts TEXT NOT NULL,
    UNIQUE KEY uq_matrix_year_office (year, office(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Master resource persons directory
CREATE TABLE IF NOT EXISTS resource_persons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    field VARCHAR(255),
    institution VARCHAR(255),
    contact VARCHAR(50),
    email VARCHAR(150)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Official notifications and user inquiries
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    target VARCHAR(100) NOT NULL DEFAULT 'all',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sender VARCHAR(100) NOT NULL,
    attachment VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_notifications_target (target)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Live support chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender VARCHAR(100) NOT NULL,
    senderRole VARCHAR(50) NOT NULL DEFAULT 'none',
    recipient VARCHAR(100) NOT NULL DEFAULT 'all',
    text TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Certificate template assets, signatory, alert text and other settings
CREATE TABLE IF NOT EXISTS settings (
    k VARCHAR(64) PRIMARY KEY,
    v MEDIUMTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permanent audit trail. Every row is chained to the previous one with a keyed hash,
-- so any later change or deletion is detected by "Verify integrity". Rows cannot be updated or deleted.
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    createdAt DATETIME NOT NULL,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    action VARCHAR(60) NOT NULL,
    entity VARCHAR(60) NULL,
    entityId VARCHAR(100) NULL,
    details MEDIUMTEXT NULL,
    ip VARCHAR(45) NULL,
    userAgent VARCHAR(255) NULL,
    prevHash CHAR(64) NOT NULL,
    hash CHAR(64) NOT NULL,
    KEY idx_audit_created (createdAt),
    KEY idx_audit_action (action),
    KEY idx_audit_user (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Failed logins, used to block password guessing
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    attemptedAt DATETIME NOT NULL,
    KEY idx_attempt_user (username, attemptedAt),
    KEY idx_attempt_ip (ip, attemptedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every certificate downloaded or printed (register of issued certificates)
CREATE TABLE IF NOT EXISTS certificate_issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recordId INT NOT NULL,
    certSerial VARCHAR(40) NULL,
    certType VARCHAR(20) NOT NULL,
    mode VARCHAR(10) NOT NULL,
    issuedAt DATETIME NOT NULL,
    issuedBy VARCHAR(100) NULL,
    ip VARCHAR(45) NULL,
    KEY idx_issue_record (recordId, certType),
    KEY idx_issue_date (issuedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

<?php
// ============================================================
//  MDTU system settings - edit this file only
// ============================================================
//
//  The same file is used in both places. Do not edit this when uploading.
//
//  This computer (XAMPP, Windows): database mdtu_db, user root, no password.
//  SLT / cPanel (Linux): the existing hosting database. Tables for this
//  system are created automatically the first time the site is opened.
//  DB_HOST is localhost on both.

if (stripos(PHP_OS, 'WIN') === 0) {
    define('DB_HOST', 'localhost');
    define('DB_PORT', 3306);
    define('DB_NAME', 'mdtu_db');
    define('DB_USER', 'root');
    define('DB_PASS', '');
} else {
    define('DB_HOST', 'localhost');
    define('DB_PORT', 3306);
    define('DB_NAME', 'mdtunwgo_mdtu');
    define('DB_USER', 'mdtunwgo_dbuser');
    define('DB_PASS', 'LsHnaTiuBg2Ih1A&');
}

const APP_TIMEZONE = 'Asia/Colombo';

// Secret key that seals the audit trail. Keep a safe copy of this file.
// NEVER change it after the system is in use: older audit entries could then no longer be verified.
const AUDIT_KEY = '3c342374c7694fddf25ff0a250ccbe1756e76209a74aefec8ba65cc53a5298ac';

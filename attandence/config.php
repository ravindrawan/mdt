<?php
// ============================================================
//  MDTU system settings - edit this file only
// ============================================================
//
//  Local XAMPP (this computer): keep the values below.
//
//  SLT / cPanel web hosting:
//    1. cPanel > MySQL Databases: create a database and a user,
//       then "Add User To Database" with ALL PRIVILEGES.
//    2. cPanel adds your account name in front, e.g. "mdtunwgo_mdtu".
//       Copy the FULL names into DB_NAME and DB_USER below.
//    3. DB_HOST is normally 'localhost' on SLT hosting.
//    The tables are created automatically the first time the site is opened.







const DB_HOST = 'mdtunwgo-mdtu-db';
const DB_PORT = 3306;
const DB_NAME = 'mdtunwgo_mdtu';
const DB_USER = 'mdtunwgo_dbuser';
const DB_PASS = 'LsHnaTiuBg2Ih1A&';

const APP_TIMEZONE = 'Asia/Colombo';

// Secret key that seals the audit trail. Keep a safe copy of this file.
// NEVER change it after the system is in use: older audit entries could then no longer be verified.
const AUDIT_KEY = '3c342374c7694fddf25ff0a250ccbe1756e76209a74aefec8ba65cc53a5298ac';

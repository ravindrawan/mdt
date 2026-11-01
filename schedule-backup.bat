@echo off
REM Run daily at 16:00 via Windows Task Scheduler.
REM Program/script: this .bat file
REM Start in: this folder
"C:\xampp\php\php.exe" "%~dp0backup-cron.php"

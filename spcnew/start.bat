@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  SPC සෞඛ්‍ය දිනපොත — MDTU
echo  බ්‍රව්සරය: http://127.0.0.1:8888
echo  නවත්වන්න: මෙම කවුළුව වසන්න
echo.
start "" "http://127.0.0.1:8888"
"C:\xampp\php\php.exe" -S 127.0.0.1:8888 -t "%~dp0." "%~dp0router.php"

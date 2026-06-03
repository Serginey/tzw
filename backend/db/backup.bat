@echo off
:: FEMS Database Backup Script (Windows)
:: Run this via Task Scheduler for automated backups

set DB_NAME=fems_db
set DB_USER=postgres
set BACKUP_DIR=.\backups

:: Get current date/time in a safe format for filenames
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set mytime=%mytime: =%

set BACKUP_FILE=%BACKUP_DIR%\%DB_NAME%_backup_%mydate%_%mytime%.sql

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Starting backup of database: %DB_NAME%
pg_dump -U %DB_USER% %DB_NAME% > "%BACKUP_FILE%"

if %ERRORLEVEL% equ 0 (
    echo ✅ Backup successful: %BACKUP_FILE%
) else (
    echo ❌ Backup failed!
)
pause

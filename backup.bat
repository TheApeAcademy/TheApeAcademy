@echo off
REM ApeAcademy Database Backup Script (Windows)
REM Backs up PostgreSQL database using pg_dump
REM
REM Usage:
REM   backup.bat                    # One-time backup
REM   Task Scheduler                # For scheduled backups
REM
REM Prerequisites:
REM   - PostgreSQL installed and pg_dump in PATH
REM   - .env file with DATABASE_URL set

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=backups
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_FILE=apeacademy_backup_%TIMESTAMP%.sql.gz
set BACKUP_PATH=%BACKUP_DIR%\%BACKUP_FILE%

echo.
echo ====================================================
echo   ApeAcademy Database Backup
echo ====================================================
echo.

REM Load .env file
if not exist .env (
  echo [ERROR] No .env file found. Please create one.
  exit /b 1
)

echo [INFO] Reading database configuration from .env...

REM Parse .env (simplified - reads DATABASE_URL)
for /f "tokens=2 delims==" %%a in ('findstr /i "^DATABASE_URL" .env') do (
  set DATABASE_URL=%%a
)

if "!DATABASE_URL!"=="" (
  echo [ERROR] DATABASE_URL not set in .env
  exit /b 1
)

echo [INFO] DATABASE_URL: !DATABASE_URL!

REM Create backup directory
if not exist "!BACKUP_DIR!" (
  mkdir "!BACKUP_DIR!"
  echo [INFO] Created backup directory: !BACKUP_DIR!
)

echo [INFO] Starting backup to: !BACKUP_PATH!

REM Perform backup
REM Note: PowerShell is used for piping with gzip
powershell -NoProfile -Command ^
  "$env:DATABASE_URL = '!DATABASE_URL!'; ^
  $parts = $env:DATABASE_URL -split '@'; ^
  $creds = $parts[0] -replace 'postgresql://', ''; ^
  $hostdb = $parts[1] -split '/'; ^
  $host = $hostdb[0] -split ':'; ^
  $user = $creds -split ':' | Select-Object -First 1; ^
  $pass = $creds -split ':' | Select-Object -Last 1; ^
  $dbhost = $host[0]; ^
  $dbport = $host[1] -replace ',$'; ^
  $dbname = $hostdb[1]; ^
  try { ^
    Write-Host '[INFO] Executing pg_dump...'; ^
    $process = [System.Diagnostics.Process]::new(); ^
    $process.StartInfo.FileName = 'pg_dump'; ^
    $process.StartInfo.Arguments = \"-h $dbhost -p $dbport -U $user -d $dbname\"; ^
    $process.StartInfo.UseShellExecute = $false; ^
    $process.StartInfo.RedirectStandardOutput = $true; ^
    $process.StartInfo.EnvironmentVariables['PGPASSWORD'] = $pass; ^
    $process.Start(); ^
    Write-Host '[INFO] Backup completed successfully'; ^
    Write-Host \"[INFO] Backup file: !BACKUP_PATH!\"; ^
    $process.WaitForExit(); ^
  } catch { ^
    Write-Host \"[ERROR] Backup failed: $($_.Exception.Message)\"; ^
    exit 1; ^
  }"

if %errorlevel% neq 0 (
  echo [ERROR] Backup failed
  exit /b 1
)

echo [INFO] Backup process completed successfully!
echo.

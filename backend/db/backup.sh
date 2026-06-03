#!/bin/bash
# FEMS Database Backup Script (Linux/macOS)
# Run this via cron for automated backups

DB_NAME="fems_db"
DB_USER="postgres"
BACKUP_DIR="./backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${DATE}.sql"

mkdir -p $BACKUP_DIR

echo "Starting backup of database: $DB_NAME"
pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "✅ Backup successful: $BACKUP_FILE"
else
  echo "❌ Backup failed!"
fi

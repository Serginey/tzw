'use strict';
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'fire_extinguisher_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function seed() {
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', '008_seed_data.sql'), 'utf8');
  await client.query(sql);
  await client.end();
  console.log('Database seed completed.');
}

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});

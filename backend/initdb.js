import dotenv from "dotenv";
import fs from "fs";
import { PGlite } from '@electric-sql/pglite';

dotenv.config();

// Use in-memory database for testing
const db = new PGlite();

async function initDb() {
  try {
    // Read and split SQL commands
    const dbInitCommands = fs
      .readFileSync(`./db.sql`, "utf-8")
      .toString()
      .split(/(?=CREATE TABLE |INSERT INTO)/);

    // Execute each command
    for (let cmd of dbInitCommands) {
      if (cmd.trim()) {
        console.dir({ "backend:db:init:command": cmd });
        await db.query(cmd);
      }
    }

    console.log('Database initialization completed successfully');
  } catch (e) {
    console.error('Database initialization failed:', e);
    throw e;
  }
}

// Execute initialization
initDb().catch(console.error);
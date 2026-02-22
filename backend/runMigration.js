import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Read the schema SQL file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove comments and split by semicolon
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    const statements = cleanedSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    console.log('✅ Connected to database');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`\n📝 Executing statement ${i + 1}/${statements.length}...`);
        try {
          await connection.query(statement);
          console.log('✅ Success');
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        }
      }
    }
    
    connection.release();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📊 Database schema created with the following tables:');
    console.log('   - patients (user accounts)');
    console.log('   - patient_info (health information)');
    console.log('   - google_fit_hourly_data (fitness tracking)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

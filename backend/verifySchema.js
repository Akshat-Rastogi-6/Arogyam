import pool from './config/db.js';

async function verifySchema() {
  try {
    console.log('🔍 Verifying database schema...\n');
    
    const connection = await pool.getConnection();
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Tables in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   ✓ ${tableName}`);
    });
    
    // Check patients table structure
    console.log('\n📊 Patients table structure:');
    const [patientsCols] = await connection.query('DESCRIBE patients');
    patientsCols.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // Check patient_info table structure
    console.log('\n📊 Patient_info table structure:');
    const [patientInfoCols] = await connection.query('DESCRIBE patient_info');
    console.log(`   Total fields: ${patientInfoCols.length}`);
    
    // Check google_fit_hourly_data table structure
    console.log('\n📊 Google_fit_hourly_data table structure:');
    const [googleFitCols] = await connection.query('DESCRIBE google_fit_hourly_data');
    console.log(`   Total fields: ${googleFitCols.length}`);
    
    connection.release();
    
    console.log('\n✅ Schema verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifySchema();

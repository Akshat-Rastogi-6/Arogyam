// Helper file to convert MySQL results to match PostgreSQL-style results
// This helps minimize changes to existing controller code

export const queryHelper = async (pool, sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return { rows };
};

export const queryOne = async (pool, sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
};

export const insertAndReturn = async (pool, sql, params = []) => {
  const [result] = await pool.query(sql, params);
  if (result.insertId) {
    // Fetch the inserted row
    const tableName = sql.match(/INSERT INTO (\w+)/i)[1];
    const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  return null;
};

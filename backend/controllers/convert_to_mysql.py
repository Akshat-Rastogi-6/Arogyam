import re
import sys

def convert_pg_to_mysql(file_content):
    """Convert PostgreSQL queries to MySQL queries"""
    
    # Replace $1, $2, etc. with ? in correct order
    def replace_params(match):
        query = match.group(0)
        # Find all $N patterns and replace with ?
        i = 1
        while f'${i}' in query:
            query = query.replace(f'${i}', '?', 1)
            i += 1
        return query
    
    # Find all pool.query calls and replace parameters
    content = re.sub(
        r'pool\.query\([^)]+\)',
        replace_params,
        file_content,
        flags=re.DOTALL
    )
    
    # Replace PostgreSQL result destructuring with MySQL style
    content = re.sub(r'const\s+\{\s*rows\s*\}\s*=\s*await\s+pool\.query', 
                    'const [rows] = await pool.query', content)
    
    # Replace to_timestamp with FROM_UNIXTIME
    content = re.sub(r'to_timestamp\(\?+\)', 'FROM_UNIXTIME(?)', content)
    
    # Replace NOW() calls  - these are already compatible
    
    # Replace ON CONFLICT with ON DUPLICATE KEY UPDATE for inserts
    # This is more complex and would need manual review
    
    return content

# Read the input file
with open('patientController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Convert
converted = convert_pg_to_mysql(content)

# Write output
with open('patientController.mysql.js', 'w', encoding='utf-8') as f:
    f.write(converted)

print("Conversion complete!")

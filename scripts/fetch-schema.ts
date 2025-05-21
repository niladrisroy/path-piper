
import { supabase } from '../lib/supabase'

async function fetchSchema() {
  try {
    // Fetch tables
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('schemaname', 'public')
    
    if (tablesError) throw tablesError

    // Fetch columns for each table
    const schemaData = await Promise.all(
      tables.map(async (table) => {
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('*')
          .eq('table_schema', 'public')
          .eq('table_name', table.tablename)
        
        if (columnsError) throw columnsError
        
        return {
          table: table.tablename,
          columns
        }
      })
    )

    // Generate markdown documentation
    const markdown = generateMarkdown(schemaData)
    console.log(markdown)
  } catch (error) {
    console.error('Error fetching schema:', error)
  }
}

function generateMarkdown(schema) {
  let md = '# PathPiper Database Schema\n\n'
  
  schema.forEach(({ table, columns }) => {
    md += `## ${table}\n\n`
    md += '| Column | Type | Nullable | Default |\n'
    md += '|--------|------|----------|----------|\n'
    
    columns.forEach((col) => {
      md += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || '-'} |\n`
    })
    
    md += '\n'
  })
  
  return md
}

fetchSchema()

import { supabase } from '../lib/supabase'

async function fetchSchema() {
  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schema')
      .select()

    if (tablesError) throw tablesError

    // Generate markdown documentation
    const markdown = generateMarkdown(tables || [])
    console.log(markdown)
    return markdown
  } catch (error) {
    console.error('Error fetching schema:', error)
  }
}

function generateMarkdown(tables: any[]) {
  let md = '# PathPiper Database Schema\n\n'

  tables.forEach((table) => {
    md += `## ${table.table_name}\n\n`
    md += '| Column | Type | Nullable | Default | Description |\n'
    md += '|--------|------|----------|----------|-------------|\n'

    table.columns?.forEach((col: any) => {
      md += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${col.column_default || '-'} | ${col.description || '-'} |\n`
    })

    md += '\n'
  })

  return md
}

// Execute the function
fetchSchema()
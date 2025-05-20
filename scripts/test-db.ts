
import { testDatabaseConnections } from '../lib/db-utils'

async function main() {
  const results = await testDatabaseConnections()
  console.log('Connection Test Results:', results)
  process.exit(results.success ? 0 : 1)
}

main().catch(console.error)

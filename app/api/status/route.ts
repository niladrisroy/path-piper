
import { NextResponse } from 'next/server'
import { testDatabaseConnections } from '@/lib/db-utils'

export async function GET() {
  const status = await testDatabaseConnections()
  return NextResponse.json(status)
}

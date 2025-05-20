
import { prisma } from '../lib/prisma'
import { supabase } from '../lib/supabase'

async function main() {
  console.log('Testing database connections...')
  
  try {
    // Test Prisma
    await prisma.$connect()
    const prismaTest = await prisma.$queryRaw`SELECT 1`
    console.log('✅ Prisma connection successful')
    
    // Test Supabase
    const { data, error } = await supabase.from('profiles').select('count')
    if (error) throw error
    console.log('✅ Supabase connection successful')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)

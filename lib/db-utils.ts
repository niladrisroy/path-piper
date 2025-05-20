
import { prisma, testPrismaConnection } from './prisma'
import { supabase, testSupabaseConnection } from './supabase'

export async function testDatabaseConnections() {
  const results = {
    prisma: await testPrismaConnection(),
    supabase: await testSupabaseConnection()
  }
  
  console.log('Database connection test results:', results)
  return results
}

export async function getUser(userId: string) {
  try {
    const { data: supabaseUser, error: supabaseError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (supabaseError) throw supabaseError

    const prismaUser = await prisma.profile.findUnique({
      where: { id: userId }
    })

    return {
      supabase: supabaseUser,
      prisma: prismaUser
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

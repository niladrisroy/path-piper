
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, role } = body

    const user = await prisma.user.create({
      data: {
        email,
        password, // Note: In production, hash the password
        name,
        role,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

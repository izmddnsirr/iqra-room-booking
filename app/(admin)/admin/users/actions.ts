'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Role } from '@/lib/auth'

export type CreateUserState = { error?: string; success?: boolean } | undefined

export async function createUser(
  _prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    return { error: 'Not authenticated.' }
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    return { error: 'Only admins can create users.' }
  }

  const fullName = formData.get('full_name')
  const email = formData.get('email')
  const password = formData.get('password')
  const role = formData.get('role')
  const matricStaffId = formData.get('matric_staff_id')
  const phoneNumber = formData.get('phone_number')

  if (
    typeof fullName !== 'string' || !fullName ||
    typeof email !== 'string' || !email ||
    typeof password !== 'string' || !password ||
    typeof role !== 'string' || !['user', 'receptionist', 'admin'].includes(role) ||
    typeof matricStaffId !== 'string' || !matricStaffId ||
    typeof phoneNumber !== 'string' || !phoneNumber
  ) {
    return { error: 'All fields are required.' }
  }

  const adminClient = createAdminClient()

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError || !created.user) {
    return { error: createError?.message ?? 'Failed to create user.' }
  }

  const { error: profileError } = await adminClient.from('profiles').insert({
    id: created.user.id,
    full_name: fullName,
    email,
    role: role as Role,
    matric_staff_id: matricStaffId,
    phone_number: phoneNumber,
  })

  if (profileError) {
    await adminClient.auth.admin.deleteUser(created.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

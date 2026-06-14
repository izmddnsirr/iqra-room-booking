'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type RoomFormState = { error?: string; success?: boolean } | undefined

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, isAdmin: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { supabase, isAdmin: profile?.role === 'admin' }
}

export async function createRoom(
  _prevState: RoomFormState,
  formData: FormData
): Promise<RoomFormState> {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return { error: 'Only admins can manage rooms.' }

  const roomNumber = formData.get('room_number')
  const floor = formData.get('floor')

  if (typeof roomNumber !== 'string' || !roomNumber || typeof floor !== 'string' || !floor) {
    return { error: 'Room number and floor are required.' }
  }

  const { error } = await supabase.from('rooms').insert({
    room_number: roomNumber,
    floor,
  })

  if (error) {
    return { error: error.code === '23505' ? 'Room number already exists.' : error.message }
  }

  revalidatePath('/admin/rooms')
  return { success: true }
}

export async function updateRoomNotes(
  _prevState: RoomFormState,
  formData: FormData
): Promise<RoomFormState> {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return { error: 'Only admins can manage rooms.' }

  const roomId = formData.get('room_id')
  const notes = formData.get('notes')

  if (typeof roomId !== 'string' || !roomId) {
    return { error: 'Missing room.' }
  }

  const { error } = await supabase
    .from('rooms')
    .update({ notes: typeof notes === 'string' ? notes : null })
    .eq('id', roomId)

  if (error) return { error: error.message }

  revalidatePath('/admin/rooms')
  return { success: true }
}

export async function setRoomStatus(roomId: string, status: 'active' | 'hidden') {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return { error: 'Only admins can manage rooms.' }

  const { error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', roomId)

  if (error) return { error: error.message }

  revalidatePath('/admin/rooms')
  return { success: true }
}

export async function deleteRoom(roomId: string) {
  const { supabase, isAdmin } = await requireAdmin()
  if (!isAdmin) return { error: 'Only admins can manage rooms.' }

  const { error } = await supabase.from('rooms').delete().eq('id', roomId)

  if (error) return { error: error.message }

  revalidatePath('/admin/rooms')
  return { success: true }
}

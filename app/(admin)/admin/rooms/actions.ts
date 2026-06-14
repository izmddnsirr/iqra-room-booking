'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type RoomFormState = { error?: string; success?: boolean } | undefined

type AuditAction = 'created' | 'updated_notes' | 'status_changed' | 'deleted'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, isAdmin: false, userId: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { supabase, isAdmin: profile?.role === 'admin', userId: user.id }
}

async function logRoomAudit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    roomId: string | null
    roomNumber: string
    action: AuditAction
    changes?: Record<string, unknown>
    performedBy: string | null
  }
) {
  await supabase.from('room_audit_log').insert({
    room_id: params.roomId,
    room_number: params.roomNumber,
    action: params.action,
    changes: params.changes ?? null,
    performed_by: params.performedBy,
  })
}

export async function createRoom(
  _prevState: RoomFormState,
  formData: FormData
): Promise<RoomFormState> {
  const { supabase, isAdmin, userId } = await requireAdmin()
  if (!isAdmin) return { error: 'Only admins can manage rooms.' }

  const roomNumber = formData.get('room_number')
  const floor = formData.get('floor')

  if (typeof roomNumber !== 'string' || !roomNumber || typeof floor !== 'string' || !floor) {
    return { error: 'Room number and floor are required.' }
  }

  const { data: room, error } = await supabase
    .from('rooms')
    .insert({ room_number: roomNumber, floor })
    .select('id')
    .single()

  if (error) {
    return { error: error.code === '23505' ? 'Room number already exists.' : error.message }
  }

  await logRoomAudit(supabase, {
    roomId: room.id,
    roomNumber,
    action: 'created',
    changes: { room_number: roomNumber, floor },
    performedBy: userId,
  })

  revalidatePath('/admin/rooms')
  return { success: true }
}

export async function updateRoomNotes(
  _prevState: RoomFormState,
  formData: FormData
): Promise<RoomFormState> {
  const { supabase, isAdmin, userId } = await requireAdmin()
  if (!isAdmin) return { error: 'Only admins can manage rooms.' }

  const roomId = formData.get('room_id')
  const notes = formData.get('notes')

  if (typeof roomId !== 'string' || !roomId) {
    return { error: 'Missing room.' }
  }

  const newNotes = typeof notes === 'string' ? notes : null

  const { data: existingRoom } = await supabase
    .from('rooms')
    .select('room_number, notes')
    .eq('id', roomId)
    .single()

  const { error } = await supabase
    .from('rooms')
    .update({ notes: newNotes })
    .eq('id', roomId)

  if (error) return { error: error.message }

  if (existingRoom) {
    await logRoomAudit(supabase, {
      roomId,
      roomNumber: existingRoom.room_number,
      action: 'updated_notes',
      changes: { notes: { from: existingRoom.notes, to: newNotes } },
      performedBy: userId,
    })
  }

  revalidatePath('/admin/rooms')
  return { success: true }
}

export async function setRoomStatus(roomId: string, status: 'active' | 'hidden') {
  const { supabase, isAdmin, userId } = await requireAdmin()
  if (!isAdmin) return { error: 'Only admins can manage rooms.' }

  const { data: existingRoom } = await supabase
    .from('rooms')
    .select('room_number, status')
    .eq('id', roomId)
    .single()

  const { error } = await supabase
    .from('rooms')
    .update({ status })
    .eq('id', roomId)

  if (error) return { error: error.message }

  if (existingRoom) {
    await logRoomAudit(supabase, {
      roomId,
      roomNumber: existingRoom.room_number,
      action: 'status_changed',
      changes: { status: { from: existingRoom.status, to: status } },
      performedBy: userId,
    })
  }

  revalidatePath('/admin/rooms')
  return { success: true }
}

export async function deleteRoom(roomId: string) {
  const { supabase, isAdmin, userId } = await requireAdmin()
  if (!isAdmin) return { error: 'Only admins can manage rooms.' }

  const { data: existingRoom } = await supabase
    .from('rooms')
    .select('room_number, floor, status, notes')
    .eq('id', roomId)
    .single()

  const { error } = await supabase.from('rooms').delete().eq('id', roomId)

  if (error) return { error: error.message }

  if (existingRoom) {
    await logRoomAudit(supabase, {
      roomId: null,
      roomNumber: existingRoom.room_number,
      action: 'deleted',
      changes: {
        room_number: existingRoom.room_number,
        floor: existingRoom.floor,
        status: existingRoom.status,
        notes: existingRoom.notes,
      },
      performedBy: userId,
    })
  }

  revalidatePath('/admin/rooms')
  return { success: true }
}

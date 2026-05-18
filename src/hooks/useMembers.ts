import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Profile } from '../types'

// Cliente admin com service role
const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string
)

export function useMembers() {
  const { session } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name')
    if (error) setError(error.message)
    else setMembers((data as Profile[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchMembers()
  }, [session, fetchMembers])

  const createMember = async (name: string, email: string, password: string) => {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'member' },
    })
    if (error) return { error: error.message }
    if (!data.user) return { error: 'Erro ao criar usuário' }
    await fetchMembers()
    return { error: null }
  }

  const deleteMember = async (id: string) => {
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)
    if (authError) return { error: authError.message }
    setMembers((prev) => prev.filter((m) => m.id !== id))
    return { error: null }
  }

  const changeRole = async (id: string, role: 'admin' | 'member') => {
    const { error } = await adminClient
      .from('profiles')
      .update({ role })
      .eq('id', id)
    if (error) return { error: error.message }
    await fetchMembers()
    return { error: null }
  }

  return { members, loading, error, createMember, deleteMember, changeRole }
}

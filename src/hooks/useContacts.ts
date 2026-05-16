import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Contact, ContactFormData } from '../types'

export interface ContactFilters {
  telefone: string
  memberName: string
  bairro: string
  dataInicio: string
  dataFim: string
}

export const emptyFilters: ContactFilters = {
  telefone: '',
  memberName: '',
  bairro: '',
  dataInicio: '',
  dataFim: '',
}

function applyFilters(contacts: Contact[], filters: ContactFilters): Contact[] {
  return contacts.filter((c) => {
    if (filters.telefone && !c.telefone.replace(/\D/g, '').includes(filters.telefone.replace(/\D/g, '')))
      return false
    if (filters.memberName && !c.profiles?.name.toLowerCase().includes(filters.memberName.toLowerCase()))
      return false
    if (filters.bairro && !c.bairro.toLowerCase().includes(filters.bairro.toLowerCase()))
      return false
    if (filters.dataInicio && c.created_at < filters.dataInicio)
      return false
    if (filters.dataFim && c.created_at > filters.dataFim + 'T23:59:59')
      return false
    return true
  })
}

export function useContacts() {
  const { session, isAdmin } = useAuth()
  const [allContacts, setAllContacts] = useState<Contact[]>([])
  const [filters, setFilters] = useState<ContactFilters>(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('contacts')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setAllContacts((data as Contact[]) ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (session) fetchContacts()
  }, [session, fetchContacts])

  const createContact = async (formData: ContactFormData) => {
    // Verifica duplicata antes de inserir (mesmo por RLS o DB vai rejeitar, mas damos msg amigável)
    const cleanPhone = formData.telefone.replace(/\D/g, '')
    const existing = allContacts.find(
      (c) => c.telefone.replace(/\D/g, '') === cleanPhone
    )
    if (existing) {
      return { error: `Este telefone já está cadastrado no sistema (${existing.nome}).` }
    }

    const { error } = await supabase
      .from('contacts')
      .insert({ ...formData, created_by: session!.user.id })

    if (error) {
      if (error.code === '23505') {
        return { error: 'Este telefone já está cadastrado no sistema.' }
      }
      return { error: error.message }
    }
    await fetchContacts()
    return { error: null }
  }

  const deleteContact = async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id)
    if (error) return { error: error.message }
    setAllContacts((prev) => prev.filter((c) => c.id !== id))
    return { error: null }
  }

  const contacts = applyFilters(allContacts, filters)

  const exportToCSV = (scope: 'filtered' | 'all') => {
    const data = scope === 'filtered' ? contacts : allContacts
    if (data.length === 0) return

    const headers = ['Nome', 'Telefone', 'Bairro', 'Cadastrado por', 'Data']
    const rows = data.map((c) => [
      c.nome,
      c.telefone,
      c.bairro,
      c.profiles?.name ?? '',
      new Date(c.created_at).toLocaleDateString('pt-BR'),
    ])

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')
      )
      .join('\n')

    const bom = '﻿' // UTF-8 BOM para abrir corretamente no Excel
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const filename =
      scope === 'filtered'
        ? `contatos-filtrados-${new Date().toISOString().slice(0, 10)}.csv`
        : `contatos-todos-${new Date().toISOString().slice(0, 10)}.csv`
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    contacts,
    totalUnfiltered: allContacts.length,
    loading,
    error,
    filters,
    setFilters,
    createContact,
    deleteContact,
    refetch: fetchContacts,
    exportToCSV,
    isAdmin,
  }
}

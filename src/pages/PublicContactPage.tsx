import { useState, useEffect, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'not_found'

interface MemberInfo {
  name: string
  slug: string
}

export default function PublicContactPage() {
  const { slug } = useParams<{ slug: string }>()
  const [member, setMember] = useState<MemberInfo | null>(null)
  const [loadingMember, setLoadingMember] = useState(true)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [bairro, setBairro] = useState('')
  const [igreja, setIgreja] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Formata telefone enquanto digita
  const handleTelefone = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    let formatted = digits
    if (digits.length > 10) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
    } else if (digits.length > 6) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    } else if (digits.length > 2) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    }
    setTelefone(formatted)
    setErrors((p) => ({ ...p, telefone: '' }))
  }

  // Busca o membro pelo slug
  useEffect(() => {
    async function fetchMember() {
      const { data } = await supabase
        .from('profiles')
        .select('name, slug')
        .eq('slug', slug)
        .single()
      if (data) setMember(data as MemberInfo)
      else setStatus('not_found')
      setLoadingMember(false)
    }
    if (slug) fetchMember()
  }, [slug])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!nome.trim()) e.nome = 'Informe seu nome completo'
    if (telefone.replace(/\D/g, '').length < 10) e.telefone = 'Informe um telefone válido'
    if (!bairro.trim()) e.bairro = 'Informe seu bairro'
    if (!igreja.trim()) e.igreja = 'Informe sua igreja'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    setErrorMsg('')

    const { data, error } = await supabase.rpc('registrar_contato_por_link', {
      p_slug: slug,
      p_nome: nome.trim(),
      p_telefone: telefone,
      p_bairro: bairro.trim(),
      p_igreja: igreja.trim(),
    })

    if (error) {
      setErrorMsg('Ocorreu um erro. Tente novamente.')
      setStatus('error')
      return
    }

    const result = data as { error: string | null }
    if (result.error === 'duplicate') {
      setErrorMsg('Este telefone já está cadastrado no sistema.')
      setStatus('error')
      return
    }
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }

    setStatus('success')
  }

  // Carregando membro
  if (loadingMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    )
  }

  // Membro não encontrado
  if (status === 'not_found' || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="rounded-2xl bg-white p-10 shadow-2xl">
            <p className="text-5xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-slate-900">Link inválido</h2>
            <p className="mt-2 text-sm text-slate-500">
              Este link de cadastro não existe ou foi removido.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Sucesso
  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-4">
        <div className="w-full max-w-sm text-center">
          <div className="rounded-2xl bg-white p-10 shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Cadastro realizado!</h2>
            <p className="mt-2 text-sm text-slate-500">
              Obrigado, <strong>{nome}</strong>!<br />
              Você foi cadastrado com sucesso.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Cadastro de Contato</h1>
          <p className="mt-2 text-sm text-primary-200">
            Convite de <span className="font-semibold text-white">{member.name}</span>
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Nome completo *</label>
              <input
                type="text"
                placeholder="Ex: Maria Oliveira"
                value={nome}
                onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: '' })) }}
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.nome ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.nome && <p className="text-xs text-red-600">{errors.nome}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Telefone / WhatsApp *</label>
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => handleTelefone(e.target.value)}
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.telefone ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.telefone && <p className="text-xs text-red-600">{errors.telefone}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Bairro *</label>
              <input
                type="text"
                placeholder="Ex: Centro"
                value={bairro}
                onChange={(e) => { setBairro(e.target.value); setErrors((p) => ({ ...p, bairro: '' })) }}
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.bairro ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.bairro && <p className="text-xs text-red-600">{errors.bairro}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Igreja *</label>
              <input
                type="text"
                placeholder="Ex: Igreja Batista Central"
                value={igreja}
                onChange={(e) => { setIgreja(e.target.value); setErrors((p) => ({ ...p, igreja: '' })) }}
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.igreja ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.igreja && <p className="text-xs text-red-600">{errors.igreja}</p>}
            </div>

            {status === 'error' && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="mt-2 w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmar cadastro
                </>
              )}
            </button>

          </form>
        </div>

        <p className="mt-6 text-center text-xs text-primary-300">
          Sistema de Cadastros — Pr. Glaucio Goulart
        </p>
      </div>
    </div>
  )
}

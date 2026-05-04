import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function PublicRegisterPage() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!nome.trim()) e.nome = 'Informe seu nome completo'
    if (!email.trim() || !email.includes('@')) e.email = 'Informe um e-mail válido'
    if (senha.length < 6) e.senha = 'A senha deve ter pelo menos 6 caracteres'
    if (senha !== confirmar) e.confirmar = 'As senhas não coincidem'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setStatus('loading')
    setErrorMsg('')

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: { name: nome.trim(), role: 'member' },
      },
    })

    if (error) {
      setErrorMsg(
        error.message === 'User already registered'
          ? 'Este e-mail já possui uma conta cadastrada.'
          : error.message
      )
      setStatus('error')
      return
    }

    // Se confirmação de e-mail está desativada, a sessão já existe — loga direto
    if (data.session) {
      navigate('/contacts')
      return
    }

    // Caso raro: confirmação ainda ativa
    setStatus('success')
  }

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
            <h2 className="text-xl font-bold text-slate-900">Conta criada!</h2>
            <p className="mt-2 text-sm text-slate-500">
              Bem-vindo(a), <strong>{nome}</strong>!
            </p>
            <a
              href="/login"
              className="mt-5 block w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors text-center"
            >
              Fazer login
            </a>
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          <p className="mt-2 text-sm text-primary-200">
            Pr. Glaucio Goulart — Sistema de Cadastros
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
              <label className="text-sm font-medium text-slate-700">E-mail *</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Senha *</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErrors((p) => ({ ...p, senha: '' })) }}
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.senha ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.senha && <p className="text-xs text-red-600">{errors.senha}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Confirmar senha *</label>
              <input
                type="password"
                placeholder="Repita a senha"
                value={confirmar}
                onChange={(e) => { setConfirmar(e.target.value); setErrors((p) => ({ ...p, confirmar: '' })) }}
                className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${errors.confirmar ? 'border-red-400' : 'border-slate-300'}`}
              />
              {errors.confirmar && <p className="text-xs text-red-600">{errors.confirmar}</p>}
            </div>

            {status === 'error' && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {errorMsg || 'Ocorreu um erro. Tente novamente.'}
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
                  Criando conta...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Criar minha conta
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              Já tem conta?{' '}
              <a href="/login" className="font-medium text-primary-600 hover:underline">
                Fazer login
              </a>
            </p>

          </form>
        </div>

        <p className="mt-6 text-center text-xs text-primary-300">
          Sistema de Cadastros — Pr. Glaucio Goulart
        </p>
      </div>
    </div>
  )
}

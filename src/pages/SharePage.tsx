import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../contexts/AuthContext'
import Spinner from '../components/ui/Spinner'

export default function SharePage() {
  const { profile, loading } = useAuth()
  const [copied, setCopied] = useState(false)

  if (loading || !profile) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  // Se o slug ainda não foi gerado (migration pendente), mostra aviso
  if (!profile.slug) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Compartilhar</h1>
          <p className="mt-1 text-sm text-slate-500">Compartilhe seu link para os seus contatos se afiliarem a você</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex gap-4">
          <svg className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold text-amber-800">Configuração pendente</p>
            <p className="mt-1 text-sm text-amber-700">
              O administrador precisa executar a <strong>migration_v4.sql</strong> no Supabase para ativar os links únicos.
              Após a execução, recarregue esta página.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const baseUrl = window.location.origin
  const shareUrl = `${baseUrl}/c/${profile.slug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback para browsers sem clipboard API
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Compartilhar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compartilhe seu link para os seus contatos se afiliarem a você
        </p>
      </div>

      {/* Card principal */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Seu link de afiliação</p>
              <p className="text-xs text-primary-200">Olá, {profile.name}!</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Link + botão copiar */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Seu link único
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 truncate select-all">
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-primary-600 hover:bg-primary-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Copiado!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Qualquer pessoa que acessar este link poderá se cadastrar como contato vinculado a você.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-1">
                QR Code
              </p>
              <p className="text-xs text-slate-400 text-center">
                Aponte a câmera do celular para abrir seu link
              </p>
            </div>

            <div className="rounded-2xl border-2 border-slate-100 bg-white p-5 shadow-sm">
              <QRCodeSVG
                value={shareUrl}
                size={200}
                level="M"
                includeMargin={false}
                fgColor="#1e293b"
              />
            </div>

            <p className="text-xs text-slate-400 font-mono">{profile.slug}</p>
          </div>

          {/* Dica de uso */}
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 flex gap-3">
            <svg className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-amber-700">
              Compartilhe o link ou o QR Code pelo WhatsApp, Instagram, ou imprima para eventos.
              Todos os cadastros feitos pelo seu link aparecerão em <strong>Meus Contatos</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

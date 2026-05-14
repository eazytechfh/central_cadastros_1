import { useState, type FormEvent } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { ContactFormData } from '../../types'

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<{ error: string | null }>
  onCancel?: () => void
}

const empty: ContactFormData = { nome: '', telefone: '', bairro: '', igreja: '' }

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Normaliza texto: remove espaços extras + Title Case (respeitando preposições do PT-BR)
const PREPOSITIONS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para'])

function normalizeText(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word, i) => {
      if (!word) return word
      const lower = word.toLowerCase()
      if (i !== 0 && PREPOSITIONS.has(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

export default function ContactForm({ onSubmit, onCancel }: ContactFormProps) {
  const [form, setForm] = useState<ContactFormData>(empty)
  const [errors, setErrors] = useState<Partial<ContactFormData>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const set = (field: keyof ContactFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e: Partial<ContactFormData> = {}
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    if (!form.telefone.trim()) e.telefone = 'Telefone é obrigatório'
    if (!form.bairro.trim()) e.bairro = 'Bairro é obrigatório'
    if (!form.igreja.trim()) e.igreja = 'Igreja é obrigatória'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    const { error } = await onSubmit(form)
    if (error) {
      setSubmitError(error)
    } else {
      setForm(empty)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome completo"
        placeholder="Ex: João da Silva"
        value={form.nome}
        onChange={(e) => set('nome', e.target.value)}
        onBlur={(e) => set('nome', normalizeText(e.target.value))}
        error={errors.nome}
      />
      <Input
        label="Telefone / WhatsApp"
        placeholder="(00) 00000-0000"
        value={form.telefone}
        onChange={(e) => set('telefone', formatPhone(e.target.value))}
        error={errors.telefone}
      />
      <Input
        label="Bairro"
        placeholder="Ex: Campo Grande"
        value={form.bairro}
        onChange={(e) => set('bairro', e.target.value)}
        onBlur={(e) => set('bairro', normalizeText(e.target.value))}
        error={errors.bairro}
      />
      <Input
        label="Igreja"
        placeholder="Ex: Assembleia de Deus"
        value={form.igreja}
        onChange={(e) => set('igreja', e.target.value)}
        onBlur={(e) => set('igreja', normalizeText(e.target.value))}
        error={errors.igreja}
      />

      {submitError && (
        <p className="text-sm text-red-600">{submitError}</p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={loading}>
          Salvar Contato
        </Button>
      </div>
    </form>
  )
}

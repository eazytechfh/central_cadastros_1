import { useState, useEffect, type FormEvent } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { Contact } from '../../types'

interface EditContactModalProps {
  open: boolean
  contact: Contact | null
  onClose: () => void
  onSave: (id: string, data: { nome: string; telefone: string; bairro: string }) => Promise<{ error: string | null }>
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

const PREPOSITIONS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para'])
function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').split(' ').map((word, i) => {
    if (!word) return word
    const lower = word.toLowerCase()
    if (i !== 0 && PREPOSITIONS.has(lower)) return lower
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  }).join(' ')
}

export default function EditContactModal({ open, contact, onClose, onSave }: EditContactModalProps) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [bairro, setBairro] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (contact) {
      setNome(contact.nome)
      setTelefone(contact.telefone)
      setBairro(contact.bairro)
      setErrors({})
      setSubmitError('')
    }
  }, [contact])

  const handleClose = () => {
    setErrors({})
    setSubmitError('')
    onClose()
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!nome.trim()) e.nome = 'Nome é obrigatório'
    if (telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido'
    if (!bairro.trim()) e.bairro = 'Bairro é obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setSubmitError('')
    const { error } = await onSave(contact!.id, {
      nome: normalizeText(nome),
      telefone,
      bairro: normalizeText(bairro),
    })
    if (error) {
      setSubmitError(error.includes('23505') || error.includes('duplicate')
        ? 'Este telefone já está cadastrado no sistema.'
        : error)
    } else {
      handleClose()
    }
    setLoading(false)
  }

  return (
    <Modal
      open={open}
      title="Editar Contato"
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button form="edit-contact-form" type="submit" loading={loading}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <form id="edit-contact-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome completo"
          placeholder="Ex: João da Silva"
          value={nome}
          onChange={(e) => { setNome(e.target.value); setErrors((p) => ({ ...p, nome: '' })) }}
          onBlur={(e) => setNome(normalizeText(e.target.value))}
          error={errors.nome}
          autoFocus
        />
        <Input
          label="Telefone / WhatsApp"
          placeholder="(00) 00000-0000"
          value={telefone}
          onChange={(e) => { setTelefone(formatPhone(e.target.value)); setErrors((p) => ({ ...p, telefone: '' })) }}
          error={errors.telefone}
        />
        <Input
          label="Bairro"
          placeholder="Ex: Campo Grande"
          value={bairro}
          onChange={(e) => { setBairro(e.target.value); setErrors((p) => ({ ...p, bairro: '' })) }}
          onBlur={(e) => setBairro(normalizeText(e.target.value))}
          error={errors.bairro}
        />
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      </form>
    </Modal>
  )
}

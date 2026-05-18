import { useState, useEffect, type FormEvent } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import type { Profile } from '../../types'

interface EditMemberModalProps {
  open: boolean
  member: Profile | null
  onClose: () => void
  onSave: (id: string, name: string, email: string, password: string) => Promise<{ error: string | null }>
}

export default function EditMemberModal({ open, member, onClose, onSave }: EditMemberModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Preenche os campos ao abrir
  useEffect(() => {
    if (member) {
      setName(member.name)
      setEmail(member.email)
      setPassword('')
      setError('')
    }
  }, [member])

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Nome e e-mail são obrigatórios.')
      return
    }
    if (password && password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    const { error } = await onSave(member!.id, name.trim(), email.trim(), password)
    if (error) {
      setError(error)
    } else {
      handleClose()
    }
    setLoading(false)
  }

  return (
    <Modal
      open={open}
      title="Editar Membro"
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button form="edit-member-form" type="submit" loading={loading}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <form id="edit-member-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome completo"
          placeholder="Ex: Maria Oliveira"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          required
          autoFocus
        />
        <Input
          label="E-mail"
          type="email"
          placeholder="membro@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          required
        />
        <div className="space-y-1">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Deixe em branco para não alterar"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
          />
          <p className="text-xs text-slate-400">Deixe em branco para manter a senha atual.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Modal>
  )
}

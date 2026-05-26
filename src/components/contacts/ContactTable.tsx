import { useState } from 'react'
import type { Contact } from '../../types'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import Spinner from '../ui/Spinner'

interface ContactTableProps {
  contacts: Contact[]
  loading: boolean
  showOwner?: boolean
  isAdmin?: boolean
  onDelete: (id: string) => Promise<{ error: string | null }>
  onEdit?: (contact: Contact) => void
  onAdd: () => void
}

export default function ContactTable({
  contacts,
  loading,
  showOwner = false,
  isAdmin = false,
  onDelete,
  onEdit,
  onAdd,
}: ContactTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este contato?')) return
    setDeletingId(id)
    await onDelete(id)
    setDeletingId(null)
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  }

  if (contacts.length === 0) {
    return (
      <EmptyState
        title="Nenhum contato cadastrado"
        description="Adicione seu primeiro contato clicando no botão abaixo."
        action={
          <Button onClick={onAdd}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Contato
          </Button>
        }
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Telefone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bairro</th>
            {showOwner && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Membro</th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {contacts.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.nome}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{c.telefone}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{c.bairro}</td>
              {showOwner && (
                <td className="px-4 py-3 text-sm text-slate-600">
                  {c.created_by === null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Auto-cadastro
                    </span>
                  ) : (
                    c.profiles?.name ?? '—'
                  )}
                </td>
              )}
              <td className="px-4 py-3 text-sm text-slate-500">
                {new Date(c.created_at).toLocaleDateString('pt-BR')}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {/* Botão Editar — apenas admin */}
                  {isAdmin && onEdit && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(c)}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    loading={deletingId === c.id}
                    onClick={() => handleDelete(c.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

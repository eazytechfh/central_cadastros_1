import { useState } from 'react'
import { useMembers } from '../hooks/useMembers'
import { useAuth } from '../contexts/AuthContext'
import CreateMemberModal from '../components/members/CreateMemberModal'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

export default function MembersPage() {
  const { profile: currentUser } = useAuth()
  const { members, loading, createMember, deleteMember, changeRole } = useMembers()
  const [showModal, setShowModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"? Todos os contatos cadastrados por ele também serão excluídos.`)) return
    setDeletingId(id)
    await deleteMember(id)
    setDeletingId(null)
  }

  const handleChangeRole = async (id: string, name: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin'
    const msg = newRole === 'admin'
      ? `Promover "${name}" a Administrador?`
      : `Rebaixar "${name}" para Membro?`
    if (!confirm(msg)) return
    setChangingRoleId(id)
    await changeRole(id, newRole)
    setChangingRoleId(null)
  }

  const admins  = members.filter((m) => m.role === 'admin')
  const regular = members.filter((m) => m.role === 'member')

  const renderTable = (list: typeof members) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">E-mail</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Perfil</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Desde</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {list.map((m) => {
            const isSelf = m.id === currentUser?.id
            return (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {m.name}
                  {isSelf && (
                    <span className="ml-2 text-xs text-slate-400">(você)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{m.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={m.role === 'admin' ? 'blue' : 'green'}>
                    {m.role === 'admin' ? 'Administrador' : 'Membro'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {new Date(m.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {/* Botão de promover/rebaixar — não aparece para o próprio usuário */}
                    {!isSelf && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={changingRoleId === m.id}
                        onClick={() => handleChangeRole(m.id, m.name, m.role)}
                      >
                        {m.role === 'admin' ? (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                            Tornar Membro
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            Tornar Admin
                          </>
                        )}
                      </Button>
                    )}

                    {/* Botão excluir — não aparece para o próprio usuário */}
                    {!isSelf && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingId === m.id}
                        onClick={() => handleDelete(m.id, m.name)}
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
          <p className="mt-1 text-sm text-slate-500">
            {admins.length} administrador{admins.length !== 1 ? 'es' : ''} · {regular.length} membro{regular.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Usuário
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          title="Nenhum usuário cadastrado"
          description="Adicione usuários para que possam acessar o sistema."
          action={<Button onClick={() => setShowModal(true)}>Novo Usuário</Button>}
        />
      ) : (
        <div className="space-y-6">
          {/* Administradores */}
          {admins.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Administradores
              </h2>
              {renderTable(admins)}
            </div>
          )}

          {/* Membros */}
          {regular.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Membros
              </h2>
              {renderTable(regular)}
            </div>
          )}
        </div>
      )}

      <CreateMemberModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreate={createMember}
      />
    </div>
  )
}

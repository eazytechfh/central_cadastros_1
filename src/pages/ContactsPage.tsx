import { useState, useRef, useEffect } from 'react'
import { useContacts } from '../hooks/useContacts'
import ContactTable from '../components/contacts/ContactTable'
import ContactForm from '../components/contacts/ContactForm'
import ContactFiltersBar from '../components/contacts/ContactFilters'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'

export default function ContactsPage() {
  const {
    contacts,
    totalUnfiltered,
    loading,
    filters,
    setFilters,
    createContact,
    deleteContact,
    exportToCSV,
    isAdmin,
  } = useContacts()

  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  // Fecha o menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isAdmin ? 'Todos os Contatos' : 'Meus Contatos'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {hasActiveFilters
              ? `${contacts.length} de ${totalUnfiltered} contatos`
              : `${totalUnfiltered} contato${totalUnfiltered !== 1 ? 's' : ''} cadastrado${totalUnfiltered !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters || hasActiveFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters((v) => !v)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-white/30 px-1.5 py-0.5 text-xs font-bold">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>

          {/* Botão Exportar CSV com dropdown */}
          <div className="relative" ref={exportRef}>
            <Button
              variant="secondary"
              onClick={() => setShowExportMenu((v) => !v)}
              disabled={totalUnfiltered === 0}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar
              <svg className="h-3.5 w-3.5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exportar CSV</p>
                </div>
                <button
                  onClick={() => { exportToCSV('all'); setShowExportMenu(false) }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="h-4 w-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">Todos os contatos</p>
                    <p className="text-xs text-slate-400">{totalUnfiltered} registro{totalUnfiltered !== 1 ? 's' : ''}</p>
                  </div>
                </button>
                <button
                  onClick={() => { exportToCSV('filtered'); setShowExportMenu(false) }}
                  disabled={!hasActiveFilters}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-t border-slate-100"
                >
                  <svg className="h-4 w-4 text-primary-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-medium">Contatos filtrados</p>
                    <p className="text-xs text-slate-400">
                      {hasActiveFilters
                        ? `${contacts.length} registro${contacts.length !== 1 ? 's' : ''}`
                        : 'Nenhum filtro ativo'}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <Button onClick={() => setShowModal(true)}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Contato
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ContactFiltersBar
          filters={filters}
          onChange={setFilters}
          showMemberFilter={isAdmin}
        />
      )}

      {/* Table */}
      <ContactTable
        contacts={contacts}
        loading={loading}
        showOwner={isAdmin}
        onDelete={deleteContact}
        onAdd={() => setShowModal(true)}
      />

      {/* Modal */}
      <Modal
        open={showModal}
        title="Novo Contato"
        onClose={() => setShowModal(false)}
      >
        <ContactForm
          onSubmit={async (data) => {
            const result = await createContact(data)
            if (!result.error) setShowModal(false)
            return result
          }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  )
}

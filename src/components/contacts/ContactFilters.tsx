import type { ContactFilters } from '../../hooks/useContacts'
import { emptyFilters } from '../../hooks/useContacts'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface ContactFiltersProps {
  filters: ContactFilters
  onChange: (f: ContactFilters) => void
  showMemberFilter: boolean
}

export default function ContactFiltersBar({ filters, onChange, showMemberFilter }: ContactFiltersProps) {
  const set = (key: keyof ContactFilters, value: string) =>
    onChange({ ...filters, [key]: value })

  const hasActive = Object.values(filters).some((v) => v !== '')

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Filtros</span>
        {hasActive && (
          <Button variant="ghost" size="sm" onClick={() => onChange(emptyFilters)}>
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Telefone"
          placeholder="Ex: 11999887766"
          value={filters.telefone}
          onChange={(e) => set('telefone', e.target.value)}
        />
        {showMemberFilter && (
          <Input
            label="Nome do Membro"
            placeholder="Buscar por membro..."
            value={filters.memberName}
            onChange={(e) => set('memberName', e.target.value)}
          />
        )}
        <Input
          label="Bairro"
          placeholder="Filtrar por bairro..."
          value={filters.bairro}
          onChange={(e) => set('bairro', e.target.value)}
        />
        <Input
          label="Data início"
          type="date"
          value={filters.dataInicio}
          onChange={(e) => set('dataInicio', e.target.value)}
        />
        <Input
          label="Data fim"
          type="date"
          value={filters.dataFim}
          onChange={(e) => set('dataFim', e.target.value)}
        />
      </div>
    </div>
  )
}

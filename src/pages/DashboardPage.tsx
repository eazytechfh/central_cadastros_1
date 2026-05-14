import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import { supabase } from '../lib/supabase'
import type { ChartItem } from '../types'
import StatCard from '../components/dashboard/StatCard'
import Spinner from '../components/ui/Spinner'

const MEDAL = ['🥇', '🥈', '🥉']

const BAIRRO_COLORS = ['#6366f1','#818cf8','#a5b4fc','#c7d2fe','#ddd6fe',
                       '#ede9fe','#6366f1','#818cf8','#a5b4fc','#c7d2fe']

const IGREJA_COLORS = ['#10b981','#34d399','#6ee7b7','#a7f3d0','#d1fae5',
                       '#059669','#10b981','#34d399','#6ee7b7','#a7f3d0']

interface RankingItem { id: string; name: string; role: string; total: number }

// Tooltip customizado limpo
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-sm">
        <p className="font-medium text-slate-800">{label}</p>
        <p className="text-primary-600 font-bold">{payload[0].value} contatos</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const [bairroData, setBairroData] = useState<ChartItem[]>([])
  const [igrejaData, setIgrejaData] = useState<ChartItem[]>([])
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [totalContacts, setTotalContacts] = useState(0)
  const [totalMembers, setTotalMembers] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [bairro, igreja, contacts, members, rank] = await Promise.all([
        supabase.from('contacts_by_bairro').select('*'),
        supabase.from('contacts_by_igreja').select('*'),
        supabase.from('contacts').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'member'),
        supabase.from('ranking_members').select('*').limit(10),
      ])
      setBairroData((bairro.data ?? []).map((r: { bairro: string; total: number }) => ({ name: r.bairro, total: r.total })))
      setIgrejaData((igreja.data ?? []).map((r: { igreja: string; total: number }) => ({ name: r.igreja, total: r.total })))
      setRanking((rank.data ?? []) as RankingItem[])
      setTotalContacts(contacts.count ?? 0)
      setTotalMembers(members.count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  const top10Bairros = bairroData.slice(0, 10)
  const top10Igrejas = igrejaData.slice(0, 10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral do sistema de cadastros</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total de Contatos" value={totalContacts} subtitle="em toda a base" color="indigo"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard title="Membros Ativos" value={totalMembers} subtitle="usuários com acesso" color="emerald"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard title="Bairros" value={bairroData.length} subtitle="bairros distintos" color="amber"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard title="Igrejas" value={igrejaData.length} subtitle="igrejas distintas" color="rose"
          icon={<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
      </div>

      {/* Ranking membros */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Ranking — Top 10 Cadastros</h2>
            <p className="text-xs text-slate-500">Quem mais cadastrou contatos</p>
          </div>
        </div>
        {ranking.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Nenhum dado disponível</p>
        ) : (
          <div className="space-y-2.5">
            {ranking.map((item, i) => {
              const max = ranking[0].total || 1
              const pct = Math.round((item.total / max) * 100)
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-8 text-center shrink-0">
                    {i < 3
                      ? <span className="text-lg">{MEDAL[i]}</span>
                      : <span className="text-sm font-bold text-slate-400">{i + 1}º</span>
                    }
                  </div>
                  <div className="flex items-center gap-1.5 w-48 shrink-0">
                    <span className="truncate text-sm font-medium text-slate-800">{item.name}</span>
                    {item.role === 'admin' && (
                      <span className="shrink-0 rounded-full bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700">Admin</span>
                    )}
                  </div>
                  <div className="flex-1 rounded-full bg-slate-100 h-2.5 overflow-hidden">
                    <div className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 text-right text-sm font-bold text-slate-700 shrink-0">
                    {item.total} <span className="font-normal text-slate-400 text-xs">{item.total === 1 ? 'contato' : 'contatos'}</span>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Gráficos: Top 10 Bairros e Top 10 Igrejas — barras horizontais */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* Top 10 Bairros */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Top 10 — Bairros</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {bairroData.length > 10 ? `exibindo 10 de ${bairroData.length} bairros` : `${bairroData.length} bairros`}
              </p>
            </div>
            <div className="h-7 w-7 rounded-lg bg-primary-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
          </div>

          {top10Bairros.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum dado disponível</p>
          ) : (
            <ResponsiveContainer width="100%" height={top10Bairros.length * 42}>
              <BarChart
                layout="vertical"
                data={top10Bairros}
                margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
                barSize={18}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {top10Bairros.map((_, i) => (
                    <Cell key={i} fill={BAIRRO_COLORS[i % BAIRRO_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {bairroData.length > 10 && (
            <p className="mt-3 text-center text-xs text-slate-400">
              + {bairroData.length - 10} outros bairros não exibidos
            </p>
          )}
        </div>

        {/* Top 10 Igrejas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Top 10 — Igrejas</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {igrejaData.length > 10 ? `exibindo 10 de ${igrejaData.length} igrejas` : `${igrejaData.length} igrejas`}
              </p>
            </div>
            <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          {top10Igrejas.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum dado disponível</p>
          ) : (
            <ResponsiveContainer width="100%" height={top10Igrejas.length * 42}>
              <BarChart
                layout="vertical"
                data={top10Igrejas}
                margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
                barSize={18}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 12, fill: '#475569' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                  {top10Igrejas.map((_, i) => (
                    <Cell key={i} fill={IGREJA_COLORS[i % IGREJA_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {igrejaData.length > 10 && (
            <p className="mt-3 text-center text-xs text-slate-400">
              + {igrejaData.length - 10} outras igrejas não exibidas
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

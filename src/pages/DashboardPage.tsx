import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { supabase } from '../lib/supabase'
import type { ChartItem } from '../types'
import StatCard from '../components/dashboard/StatCard'
import Spinner from '../components/ui/Spinner'

const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#14b8a6',
]

const MEDAL = ['🥇', '🥈', '🥉']

interface RankingItem {
  id: string
  name: string
  role: string
  total: number
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

      setBairroData(
        (bairro.data ?? []).map((r: { bairro: string; total: number }) => ({
          name: r.bairro,
          total: r.total,
        }))
      )
      setIgrejaData(
        (igreja.data ?? []).map((r: { igreja: string; total: number }) => ({
          name: r.igreja,
          total: r.total,
        }))
      )
      setRanking((rank.data ?? []) as RankingItem[])
      setTotalContacts(contacts.count ?? 0)
      setTotalMembers(members.count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Visão geral do sistema de cadastros</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Contatos"
          value={totalContacts}
          subtitle="em toda a base"
          color="indigo"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Membros Ativos"
          value={totalMembers}
          subtitle="usuários com acesso"
          color="emerald"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Bairros Cadastrados"
          value={bairroData.length}
          subtitle="bairros distintos"
          color="amber"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Igrejas Cadastradas"
          value={igrejaData.length}
          subtitle="igrejas distintas"
          color="rose"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
      </div>

      {/* TOP 10 Ranking */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Ranking — Top 10 Membros</h2>
            <p className="text-xs text-slate-500">Membros com mais contatos cadastrados</p>
          </div>
        </div>

        {ranking.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">Nenhum dado disponível</p>
        ) : (
          <div className="space-y-3">
            {ranking.map((item, i) => {
              const max = ranking[0].total || 1
              const pct = Math.round((item.total / max) * 100)
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-8 text-center">
                    {i < 3 ? (
                      <span className="text-lg">{MEDAL[i]}</span>
                    ) : (
                      <span className="text-sm font-bold text-slate-400">{i + 1}º</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 w-44">
                    <span className="truncate text-sm font-medium text-slate-800">{item.name}</span>
                    {item.role === 'admin' && (
                      <span className="shrink-0 rounded-full bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700">Admin</span>
                    )}
                  </div>
                  <div className="flex-1 rounded-full bg-slate-100 h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm font-bold text-slate-800">{item.total}</span>
                    <span className="text-xs text-slate-400 ml-1">
                      {item.total === 1 ? 'contato' : 'contatos'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bar chart: by bairro */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Contatos por Bairro</h2>
          {bairroData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum dado disponível</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bairroData} margin={{ top: 0, right: 0, left: -10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
                  formatter={(value) => [value, 'Contatos']}
                />
                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart: by igreja */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Contatos por Igreja</h2>
          {igrejaData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum dado disponível</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={igrejaData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {igrejaData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 13 }}
                  formatter={(value) => [value, 'Contatos']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bairro ranking table */}
      {bairroData.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Ranking por Bairro</h2>
          <div className="space-y-3">
            {bairroData.slice(0, 10).map((item, i) => {
              const max = bairroData[0].total
              const pct = Math.round((item.total / max) * 100)
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-medium text-slate-400">{i + 1}</span>
                  <span className="w-40 truncate text-sm text-slate-700">{item.name}</span>
                  <div className="flex-1 rounded-full bg-slate-100 h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-primary-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-sm font-semibold text-slate-800">{item.total}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

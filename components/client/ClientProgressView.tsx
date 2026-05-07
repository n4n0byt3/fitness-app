'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera, Trophy, TrendingUp, Upload, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, METRICS } from '@/lib/utils'
import EmptyState from '@/components/shared/EmptyState'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { ProgressEntry, ProgressPhoto, Session } from '@/lib/types'

interface Props {
  clientId: string
  progressEntries: ProgressEntry[]
  progressPhotos: ProgressPhoto[]
  sessions: (Session & { exercises?: any[] })[]
}

export default function ClientProgressView({ clientId, progressEntries, progressPhotos, sessions }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0])
  const [uploading, setUploading] = useState(false)

  const chartData = progressEntries
    .filter((e) => e.metric === selectedMetric)
    .map((e) => ({ date: formatDate(e.date, 'short'), value: Number(e.value) }))

  // Personal records — best lifts from session exercises
  const prs: Record<string, { value: number; date: string }> = {}
  for (const session of sessions) {
    for (const ex of (session as any).exercises || []) {
      if (!ex.weight) continue
      const key = ex.name.toLowerCase()
      if (!prs[key] || ex.weight > prs[key].value) {
        prs[key] = { value: ex.weight, date: session.date }
      }
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const supabase = createClient()
    const path = `${clientId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('progress-photos')
      .upload(path, file)
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('progress-photos').getPublicUrl(path)
    const { error } = await supabase.from('progress_photos').insert({
      client_id: clientId,
      url: publicUrl,
      date: new Date().toISOString().split('T')[0],
    })
    if (error) toast.error(error.message)
    else { toast.success('Photo uploaded'); router.refresh() }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      {/* Progress Chart */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Progress Chart</h2>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="w-full rounded-lg border border-[#333333] bg-[#1a1a1a] px-3 py-2 text-xs text-white focus:border-[#c8c8c8] focus:outline-none sm:w-52"
          >
            {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {chartData.length < 2 ? (
          <div className="flex h-44 items-center justify-center">
            <div className="text-center">
              <TrendingUp size={32} className="mx-auto mb-2 text-[#555555]" />
              <p className="text-sm text-[#555555]">Not enough data yet</p>
              <p className="text-xs text-[#444444]">Your PT adds progress entries to track you here</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis dataKey="date" stroke="#555555" tick={{ fontSize: 10, fill: '#888888' }} />
              <YAxis stroke="#555555" tick={{ fontSize: 10, fill: '#888888' }} />
              <Tooltip
                contentStyle={{ background: '#222222', border: '1px solid #333333', borderRadius: '8px', color: '#fff' }}
                labelStyle={{ color: '#c8c8c8' }}
              />
              <Line type="monotone" dataKey="value" stroke="#c8c8c8" strokeWidth={2.5}
                dot={{ fill: '#c8c8c8', r: 4 }} activeDot={{ r: 6, fill: '#ffffff' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Personal Records */}
      {Object.keys(prs).length > 0 && (
        <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-white">
            <Trophy size={16} className="text-amber-400" /> Personal Records
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(prs)
              .sort((a, b) => b[1].value - a[1].value)
              .slice(0, 8)
              .map(([name, pr]) => (
                <div key={name} className="flex items-center justify-between rounded-lg bg-[#1a1a1a] px-4 py-3">
                  <span className="text-sm font-medium capitalize text-white">{name}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#c8c8c8]">{pr.value}kg</span>
                    <p className="text-[10px] text-[#555555]">{formatDate(pr.date)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Progress Photos */}
      <div className="rounded-xl border border-[#333333] bg-[#222222] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Progress Photos</h2>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-[#333333] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#888888] hover:border-[#c8c8c8]/30 hover:text-[#c8c8c8] disabled:opacity-60 transition-all"
          >
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Upload
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
        {progressPhotos.length === 0 ? (
          <EmptyState icon={Camera} title="No photos yet" description="Upload progress photos to track your transformation visually." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {progressPhotos.map((photo) => (
              <div key={photo.id} className="relative overflow-hidden rounded-lg bg-[#1a1a1a] aspect-square">
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 px-2 py-2">
                  <p className="text-[10px] text-white">{formatDate(photo.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

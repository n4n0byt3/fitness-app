import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/pt/SettingsForm'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-[#888888]">Account and business preferences</p>
      </div>
      <SettingsForm profile={profile} />
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientNav from '@/components/client/ClientNav'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'pt') redirect('/dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1a1a]">
      <ClientNav clientName={profile?.full_name || 'Client'} />
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  )
}

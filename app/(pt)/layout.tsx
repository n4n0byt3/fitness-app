import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/pt/Sidebar'
import BottomNav from '@/components/pt/BottomNav'

export default async function PTLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'pt') redirect('/portal/dashboard')

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a1a1a]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar ptName={profile.full_name} ptEmail={profile.email} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  )
}

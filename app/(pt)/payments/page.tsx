import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import PaymentsManager from '@/components/pt/PaymentsManager'

export const metadata: Metadata = { title: 'Payments' }

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: invoices }, { data: clients }] = await Promise.all([
    supabase
      .from('invoices')
      .select('*, profiles!invoices_client_id_fkey(id, full_name, email)')
      .eq('pt_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('client_profiles')
      .select('user_id, profiles!client_profiles_user_id_fkey(id, full_name, email)')
      .eq('pt_id', user.id),
  ])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Payments</h1>
        <p className="mt-0.5 text-sm text-[#888888]">Invoicing and revenue tracking</p>
      </div>
      <PaymentsManager
        ptId={user.id}
        initialInvoices={(invoices || []).map((inv: any) => ({ ...inv, client: inv.profiles }))}
        clients={(clients || []).map((c: any) => c.profiles).filter(Boolean)}
      />
    </div>
  )
}

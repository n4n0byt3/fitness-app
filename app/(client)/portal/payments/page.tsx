import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientPaymentsView from '@/components/client/ClientPaymentsView'

export const metadata: Metadata = { title: 'Payments' }

export default async function ClientPaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-white">Payments</h1>
        <p className="mt-0.5 text-sm text-[#888888]">Your invoice history</p>
      </div>
      <ClientPaymentsView invoices={invoices || []} />
    </div>
  )
}

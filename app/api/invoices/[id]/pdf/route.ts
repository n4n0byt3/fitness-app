import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import React from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  brandName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', letterSpacing: 3 },
  brandSub: { fontSize: 8, color: '#888888', letterSpacing: 4, marginTop: 2 },
  invoiceTitle: { fontSize: 32, fontFamily: 'Helvetica-Bold', color: '#1a1a1a', textAlign: 'right' },
  invoiceNum: { fontSize: 10, color: '#888888', textAlign: 'right', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#dddddd', marginBottom: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  col: { flex: 1 },
  label: { fontSize: 7, color: '#888888', letterSpacing: 3, marginBottom: 4 },
  value: { fontSize: 11, color: '#1a1a1a', fontFamily: 'Helvetica-Bold' },
  valueNormal: { fontSize: 11, color: '#1a1a1a' },
  table: { marginTop: 24 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f5f5f5', padding: 10, borderRadius: 4 },
  tableHeaderText: { fontSize: 8, color: '#888888', letterSpacing: 2, fontFamily: 'Helvetica-Bold' },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eeeeee' },
  tableCell: { fontSize: 11, color: '#1a1a1a' },
  total: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  totalBox: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 6, minWidth: 160, alignItems: 'flex-end' },
  totalLabel: { fontSize: 8, color: '#c8c8c8', letterSpacing: 3 },
  totalValue: { fontSize: 22, color: '#ffffff', fontFamily: 'Helvetica-Bold', marginTop: 4 },
  status: { fontSize: 8, letterSpacing: 3, marginTop: 6, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40 },
  footerText: { fontSize: 8, color: '#aaaaaa', textAlign: 'center' },
})

function InvoicePDF({ invoice, client, pt }: { invoice: any; client: any; pt: any }) {
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "L'ESTRANGE FITNESS"
  const amount = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(invoice.amount)
  const invoiceNum = invoice.id.split('-')[0].toUpperCase()

  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.brandName }, brandName.toUpperCase()),
          React.createElement(Text, { style: styles.brandSub }, 'PERSONAL TRAINING')
        ),
        React.createElement(View, null,
          React.createElement(Text, { style: styles.invoiceTitle }, 'INVOICE'),
          React.createElement(Text, { style: styles.invoiceNum }, `#${invoiceNum}`)
        )
      ),
      React.createElement(View, { style: styles.divider }),
      // Bill To / From / Dates
      React.createElement(View, { style: styles.row },
        React.createElement(View, { style: styles.col },
          React.createElement(Text, { style: styles.label }, 'BILL TO'),
          React.createElement(Text, { style: styles.value }, client?.full_name || ''),
          React.createElement(Text, { style: styles.valueNormal }, client?.email || ''),
          client?.phone ? React.createElement(Text, { style: styles.valueNormal }, client.phone) : null
        ),
        React.createElement(View, { style: styles.col },
          React.createElement(Text, { style: styles.label }, 'FROM'),
          React.createElement(Text, { style: styles.value }, pt?.full_name || ''),
          React.createElement(Text, { style: styles.valueNormal }, pt?.email || '')
        ),
        React.createElement(View, { style: styles.col },
          React.createElement(Text, { style: styles.label }, 'ISSUE DATE'),
          React.createElement(Text, { style: styles.value }, new Date(invoice.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })),
          React.createElement(Text, { style: { ...styles.label, marginTop: 12 } }, 'DUE DATE'),
          React.createElement(Text, { style: styles.value }, new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
        )
      ),
      // Line Items
      React.createElement(View, { style: styles.table },
        React.createElement(View, { style: styles.tableHeader },
          React.createElement(Text, { style: { ...styles.tableHeaderText, flex: 3 } }, 'DESCRIPTION'),
          React.createElement(Text, { style: { ...styles.tableHeaderText, flex: 1, textAlign: 'right' } }, 'AMOUNT')
        ),
        React.createElement(View, { style: styles.tableRow },
          React.createElement(Text, { style: { ...styles.tableCell, flex: 3 } }, invoice.description),
          React.createElement(Text, { style: { ...styles.tableCell, flex: 1, textAlign: 'right', fontFamily: 'Helvetica-Bold' } }, amount)
        )
      ),
      // Total
      React.createElement(View, { style: styles.total },
        React.createElement(View, { style: styles.totalBox },
          React.createElement(Text, { style: styles.totalLabel }, 'TOTAL DUE'),
          React.createElement(Text, { style: styles.totalValue }, amount),
          React.createElement(Text, { style: { ...styles.status, color: invoice.status === 'paid' ? '#4ade80' : '#f59e0b' } },
            invoice.status.toUpperCase()
          )
        )
      ),
      // Footer
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, { style: styles.footerText }, `${brandName} — Thank you for your business`)
      )
    )
  )
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [{ data: client }, { data: pt }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', invoice.client_id).single(),
      supabase.from('profiles').select('*').eq('id', invoice.pt_id).single(),
    ])

    const stream = await renderToStream(
      React.createElement(InvoicePDF, { invoice, client, pt }) as any
    )

    const chunks: Uint8Array[] = []
    for await (const chunk of stream as any) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const buffer = Buffer.concat(chunks)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${invoice.id.split('-')[0]}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

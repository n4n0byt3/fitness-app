import { Resend } from 'resend'

function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "L'Estrange Fitness"
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendBookingConfirmation({
  to,
  clientName,
  date,
  time,
  sessionType,
}: {
  to: string
  clientName: string
  date: string
  time: string
  sessionType: string
}) {
  const resend = getResend()
  if (!resend) return
  return resend.emails.send({
    from: `${brandName} <${fromEmail}>`,
    to,
    subject: `Booking Confirmed — ${date} at ${time}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #ffffff; padding: 40px; border-radius: 8px;">
        <h1 style="color: #c8c8c8; font-size: 24px; margin-bottom: 8px;">${brandName}</h1>
        <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 24px;">Booking Confirmed</h2>
        <p style="color: #c8c8c8;">Hi ${clientName},</p>
        <p style="color: #c8c8c8;">Your training session has been confirmed.</p>
        <div style="background: #222222; border: 1px solid #333333; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="color: #ffffff; margin: 0 0 8px;"><strong>Date:</strong> ${date}</p>
          <p style="color: #ffffff; margin: 0 0 8px;"><strong>Time:</strong> ${time}</p>
          <p style="color: #ffffff; margin: 0;"><strong>Session Type:</strong> ${sessionType}</p>
        </div>
        <a href="${appUrl}/portal/bookings" style="display: inline-block; background: #c8c8c8; color: #1a1a1a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View My Bookings</a>
      </div>
    `,
  })
}

export async function sendInvoiceNotification({
  to,
  clientName,
  amount,
  description,
  dueDate,
  paymentUrl,
}: {
  to: string
  clientName: string
  amount: string
  description: string
  dueDate: string
  paymentUrl: string
}) {
  const resend = getResend()
  if (!resend) return
  return resend.emails.send({
    from: `${brandName} <${fromEmail}>`,
    to,
    subject: `Invoice — ${amount} due ${dueDate}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #ffffff; padding: 40px; border-radius: 8px;">
        <h1 style="color: #c8c8c8; font-size: 24px; margin-bottom: 8px;">${brandName}</h1>
        <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 24px;">New Invoice</h2>
        <p style="color: #c8c8c8;">Hi ${clientName},</p>
        <p style="color: #c8c8c8;">A new invoice has been issued for your account.</p>
        <div style="background: #222222; border: 1px solid #333333; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="color: #ffffff; margin: 0 0 8px;"><strong>Description:</strong> ${description}</p>
          <p style="color: #ffffff; margin: 0 0 8px;"><strong>Amount:</strong> ${amount}</p>
          <p style="color: #ffffff; margin: 0;"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <a href="${paymentUrl}" style="display: inline-block; background: #c8c8c8; color: #1a1a1a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Pay Now</a>
      </div>
    `,
  })
}

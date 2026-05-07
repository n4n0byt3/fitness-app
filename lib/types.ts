export type Role = 'pt' | 'client'

export type Profile = {
  id: string
  role: Role
  full_name: string
  email: string
  phone: string | null
  created_at: string
}

export type ClientProfile = {
  id: string
  user_id: string
  pt_id: string
  goal: string | null
  start_date: string | null
  notes: string | null
  photo_url: string | null
  created_at: string
  profile?: Profile
}

export type ClientWithProfile = Profile & {
  client_profile: ClientProfile
  last_session_date?: string | null
  session_count?: number
}

export type Session = {
  id: string
  client_id: string
  pt_id: string
  date: string
  type: string
  duration: number
  notes: string | null
  created_at: string
  exercises?: Exercise[]
  client?: Profile
}

export type Exercise = {
  id: string
  session_id: string
  name: string
  sets: number
  reps: number
  weight: number | null
  rest_time: number | null
}

export type ProgressEntry = {
  id: string
  client_id: string
  date: string
  metric: string
  value: number
}

export type ProgressPhoto = {
  id: string
  client_id: string
  url: string
  date: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export type Booking = {
  id: string
  client_id: string
  pt_id: string
  date: string
  time: string
  session_type: string
  status: BookingStatus
  created_at: string
  client?: Profile
}

export type Availability = {
  id: string
  pt_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export type InvoiceStatus = 'outstanding' | 'paid' | 'overdue'

export type Invoice = {
  id: string
  client_id: string
  pt_id: string
  amount: number
  description: string
  due_date: string
  status: InvoiceStatus
  stripe_payment_id: string | null
  stripe_checkout_url: string | null
  created_at: string
  client?: Profile
}

export type DashboardStats = {
  total_clients: number
  sessions_this_week: number
  revenue_this_month: number
  outstanding_payments: number
}

export type Prediction = {
  id: string
  user_id: string | null
  label: string
  confidence: number
  source: 'upload' | 'camera'
  occurred_at: string
  created_at?: string
}

export type AppUser = {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at?: string
  updated_at?: string
}

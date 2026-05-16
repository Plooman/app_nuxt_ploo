export type UserRole = 'admin' | 'manager' | 'user'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface News {
  id: string
  title: string
  slug: string
  content: string | null
  cover_url: string | null
  published: boolean
  published_at: string | null
  author_id: string | null
  created_at: string
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'done' | 'cancelled'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  qty: number
  price_snapshot: number
}

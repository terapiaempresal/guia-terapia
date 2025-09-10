export interface Company {
    id: string
    name: string
    created_at: string
    employees_quota: number
    plan: 'equipe' | 'lider'
    status: 'inactive' | 'active'
}

export interface Manager {
    id: string
    auth_user_id: string
    company_id: string
    full_name: string
    email: string
    phone?: string
    created_at: string
}

export interface Order {
    id: string
    provider: string
    provider_order_id?: string
    company_id: string
    quantity: number
    unit_price_cents: number
    currency: string
    amount_cents: number
    status: 'pending' | 'paid' | 'failed' | 'refunded'
    created_at: string
    paid_at?: string
}

export interface Employee {
    id: string
    company_id: string
    auth_user_id?: string
    full_name?: string
    cpf?: string
    birth_date?: string
    email?: string
    whatsapp?: string
    created_at: string
    status: 'invited' | 'active' | 'blocked'
}

export interface EmployeeLoginLink {
    id: string
    company_id: string
    employee_id?: string
    order_id?: string
    token: string
    expires_at: string
    used_at?: string
}

export interface ClarityMapResult {
    id: string
    cpf: string
    result_json: any
    updated_at: string
}

export interface EmployeeDocument {
    id: string
    employee_id: string
    title: string
    content_json: any
    updated_at: string
}

export interface Video {
    id: string
    title: string
    youtube_id: string
    position: number
    is_active: boolean
    created_at: string
}

export interface VideoProgress {
    id: string
    employee_id: string
    video_id: string
    watched: boolean
    watched_at?: string
}

export interface ClarityMapStatus {
    employee_id: string
    status: 'not_started' | 'in_progress' | 'done'
    updated_at: string
}

export interface WebhookLog {
    id: string
    provider: string
    event_type?: string
    payload: any
    signature?: string
    received_at: string
    handled: boolean
    handled_at?: string
}

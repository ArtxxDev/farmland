export interface TableData {
    "id": number
    "oblast"?: string
    "region"?: string
    "cadastral"?: string
    "composition"?: string
    "area"?: number
    "ngo"?: string
    "owner"?: string
    "contract_sale"?: number
    "contract_sale_date"?: string
    "extract_land"?: string
    "extract_land_date"?: string
    "expenses"?: string
    "document_land"?: string
    "tenant"?: string
    "rent"?: number
    "rent_price"?: number
    "rent_period"?: any
    "rent_advance"?: number
    "rent_payments_per_year"?: number
    "rent_payments"?: RentPayments[] | null,
    "contract_lease"?: string
    "contract_lease_date"?: string
    "extract_lease"?: string
    "isLeased"?: any
    "document_land_lease"?: string
}

export interface UserPublic {
    "id": number
    "email": string
    "role": string
}

export interface RentPayments {
    rentYear: number
    rentValue: number
    rentValuePaid: number
    rentIsPaid: boolean
}

export interface RentDetails {
    rentAdvance: number,
    rentPeriod: number,
    rentPrice: number,
    rentPaymentsPerYear: number,
    contractLeaseDate: string,
    rentPayments: RentPayments[]
}

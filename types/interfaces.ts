export interface TableData {
    "id": number,
    "region": string,
    "oblast": string,
    "cadastral": string,
    "composition"?: string,
    "area": number,
    "ngo"?: number,
    "owner"?: string,
    "contract_sale"?: number,
    "contract_sale_date"?: string,
    "extract"?: number,
    "extract_date"?: string,
    "document"?: string,
    "expenses"?: number,
    "tenant"?: string,
    "contract_lease": string,
    "contract_lease_date": string
}

export interface UserPublic {
    "id": number,
    "email": string,
    "role": string
}

export type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'

export type OrderDetails = {
    number: string
    status: OrderStatus
    color: string
    wheels: string
    customer: { name: string, email: string, document: string, phone: string }
    payment: string
    total_price: number
    modelName?: string
    interior?: string
    modelImageAlt?: string
}

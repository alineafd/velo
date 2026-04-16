export type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'

export type OrderDetails = {
    number: string
    status: OrderStatus
    color: string
    wheels: string
    customer: { name: string, email: string }
    payment: string
    modelName?: string
    interior?: string
    modelImageAlt?: string
}

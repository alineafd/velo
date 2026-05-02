export const checkoutStores = {
  paulista: 'Velô Paulista - Av. Paulista, 1000',
  fariaLima: 'Velô Faria Lima - Av. Faria Lima, 2500',
  morumbi: 'Velô Morumbi - Av. Morumbi, 1500',
  ibirapuera: 'Velô Ibirapuera - Av. Ibirapuera, 3000',
} as const

export const checkoutCustomers = {
  maria: {
    name: 'Maria',
    lastname: 'Souza',
    email: 'maria.souza@email.com',
    phone: '11988888888',
    document: '123.456.789-01',
    store: checkoutStores.paulista,
  },
  joao: {
    name: 'João',
    lastname: 'Silva',
    email: 'joao.silva@email.com',
    phone: '11999999999',
    document: '123.456.789-01',
    store: checkoutStores.paulista,
  },
  financiamentoBase: {
    name: 'Carlos',
    lastname: 'Silva',
    email: 'carlos@email.com',
    phone: '11977777777',
    document: '234.567.890-12',
    store: checkoutStores.fariaLima,
  },
} as const

export const creditDecisionCases = [
  {
    id: 'CT06',
    title: 'Score alto aprova financiamento',
    score: 850,
    entryValue: '0',
    expectedHeading: 'Pedido Aprovado!',
  },
  {
    id: 'CT07',
    title: 'Score médio mantém pedido em análise',
    score: 600,
    entryValue: '0',
    expectedHeading: 'Pedido em Análise',
  },
  {
    id: 'CT08',
    title: 'Score baixo reprova com entrada abaixo de 50%',
    score: 300,
    entryValue: '0',
    expectedHeading: 'Crédito Reprovado',
  },
  {
    id: 'CT09',
    title: 'Entrada >= 50% sobrepõe score baixo e aprova',
    score: 300,
    entryValue: '20000',
    expectedHeading: 'Pedido Aprovado!',
  },
] as const

export const creditBoundaryCases = [
  {
    id: 'CT12',
    title: 'Score 500 com entrada 19999 reprova',
    score: 500,
    entryValue: '19999',
    expectedHeading: 'Crédito Reprovado',
  },
  {
    id: 'CT13',
    title: 'Score 500 com entrada 20000 aprova pela regra de entrada',
    score: 500,
    entryValue: '20000',
    expectedHeading: 'Pedido Aprovado!',
  },
  {
    id: 'CT14',
    title: 'Score 700 com entrada baixa fica em análise',
    score: 700,
    entryValue: '0',
    expectedHeading: 'Pedido em Análise',
  },
  {
    id: 'CT15',
    title: 'Score 701 com entrada baixa aprova',
    score: 701,
    entryValue: '0',
    expectedHeading: 'Pedido Aprovado!',
  },
  {
    id: 'CT16',
    title: 'Score 501 com entrada baixa fica em análise',
    score: 501,
    entryValue: '0',
    expectedHeading: 'Pedido em Análise',
  },
  {
    id: 'CT17',
    title: 'Score 500 com entrada 20001 aprova pela regra de entrada',
    score: 500,
    entryValue: '20001',
    expectedHeading: 'Pedido Aprovado!',
  },
] as const

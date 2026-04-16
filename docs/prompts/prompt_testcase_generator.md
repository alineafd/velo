Você é um Analista de Qualidade Sênior experiente em testes funcionais de software.

Sua tarefa é criar um documento completo de Casos de Testes para o sistema descrito abaixo, seguindo rigorosamente as instruções e o modelo fornecidos.

---

## Informações do Sistema

**Nome do sistema:** Velô Sprint - Configurador de Veículo Elétrico

**Descrição:** Uma SPA (Single Page Application) web desenvolvida em React que permite aos usuários configurar, simular financiamentos e realizar a compra do veículo elétrico Velô Sprint. O sistema calcula preços dinamicamente com base nas escolhas do cliente e possui integração com uma API de análise de crédito para validar as compras.

**Módulos/Funcionalidades a cobrir:** Landing Page, Configurador de Veículo, Checkout/Pedido, Análise de Crédito Automática, Confirmação, Consulta de Pedidos.

**Perfis de usuário:** Cliente (Usuário Comum).

**Regras de negócio relevantes:** 
- Precificação: O carro possui um valor base de R$ 40.000. Adicionar rodas "Sport" custa +R$ 2.000. Adicionar "Precision Park" custa +R$ 5.500. Adicionar "Flux Capacitor" custa +R$ 5.000.
- Juros de Financiamento: Se a opção for parcelada, o financiamento é travado em 12x com uma taxa fixa de juros compostos de 2% ao mês.
- Análise de Crédito por Score: Score > 700 (Aprovado), 501 a 700 (Em análise), <= 500 (Reprovado).
- Exceção na Aprovação de Crédito: Entrada >= 50% do valor total aprova automaticamente o pedido, ignorando o score de crédito.
- Segurança de Dados: A consulta de pedidos requer o número do pedido (`order_number`).

---

## Escopo dos Testes

Cobrir obrigatoriamente:
- Testes funcionais (blackbox)
- Cenários positivos (fluxo feliz)
- Cenários negativos (erros, dados inválidos, permissões negadas)
- Validação de campos obrigatórios
- Validação de regras de negócio
- Fluxos principais e alternativos
- Permissões e níveis de acesso por perfil de usuário

Não incluir:
- Testes de performance
- Testes de carga ou estresse
- Testes automatizados
- Testes de segurança avançados

---

## Modelo de Caso de Teste

Cada caso de teste deve seguir exatamente este formato:

---

### CT01 - Adição e Remoção de Opcionais no Veículo

#### Objetivo
Validar o cálculo dinâmico do preço total do veículo "Velô Sprint" ao adicionar e remover itens opcionais.

#### Pré-Condições
- O usuário deve estar na página do Configurador de Veículo.
- O preço base exibido inicialmente deve ser de R$ 40.000.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Na página do configurador, selecionar as rodas "Sport" | O preço total do veículo é atualizado para R$ 42.000 (+ R$ 2.000). |
| 2  | Adicionar a opção "Precision Park" | O preço total do veículo é atualizado para R$ 47.500 (+ R$ 5.500). |
| 3  | Adicionar a opção "Flux Capacitor" | O preço total do veículo é atualizado para R$ 52.500 (+ R$ 5.000). |
| 4  | Desmarcar a opção "Precision Park" | O preço total do veículo retorna para R$ 47.000. |

#### Resultados Esperados
- O sistema calcula os preços dinamicamente em tempo real refletindo sem erros os opcionais escolhidos pelo usuário.
- O preço não exibe valores corrompidos ou não calculados.

#### Critérios de Aceitação
- A matemática deve seguir exatamente a Precificação: Base 40k, Sport +2k, Park +5.5k, Flux +5k.

---

### CT02 - Análise de Crédito Reprovada por Score e Entrada

#### Objetivo
Validar que a API rejeita automaticamente financiamentos para usuários com Score insuficiente (<= 500) e entrada inferior a 50%.

#### Pré-Condições
- Usuário no Checkout com método de pagamento "Financiamento" selecionado.
- Perfil configurado para que a API retorne Score 450 para o CPF informado.

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Informar todos os dados obrigatórios validamente | Os campos não apresentam mensagens de erro de validação local. |
| 2  | Preencher 10% do valor total como entrada | O valor a ser financiado é atualizado com entrada insuficiente. |
| 3  | Clicar em "Confirmar Pedido" | A solicitação é enviada e uma resposta da Análise de Crédito é retornada. |

#### Resultados Esperados
- A aplicação informa que o pedido foi "Reprovado" com base no Score de Crédito, abortando a aprovação.

#### Critérios de Aceitação
- A tela de finalização de compra deve refletir a recusa ou impedir o avanço demonstrando o status.

---

### CT03 - Exceção de Aprovação por Entrada Alta

#### Objetivo
Confirmar que o fornecimento de uma entrada de 50% ou mais garante a aprovação da compra, independentemente de um Score baixo.

#### Pré-Condições
- Usuário submetendo o pedido via Financiamento.
- CPF de teste preparado para retornar um Score 300 (Reprovado pelas regras normais).

#### Passos

| Id | Ação | Resultado Esperado |
|----|------|--------------------|
| 1  | Inserir como valor de Entrada o equivalente a 50% (ex: R$ 20.000 em carro base) | UI atualiza os valores parcelados de acordo (Juros cobrados sobre os 50% restantes). |
| 2  | Submeter formulário | O pedido é recepcionado pela API contendo a diretiva de Entrada >= 50%. |

#### Resultados Esperados
- O pedido possui status "Aprovado" apesar do Score inferior a 501, pois atingiu a regra de exceção da entrada.

#### Critérios de Aceitação
- O sistema deve gerar o pedido e o número de sucesso sem intervenção humana.

---

## Instruções de Geração

1. Numere os casos de teste sequencialmente: CT01, CT02, CT03...
2. Cubra no mínimo os seguintes fluxos base para cada módulo informado:
   - Operação bem-sucedida (fluxo feliz)
   - Operação com dados inválidos ou incompletos
   - Operação sem permissão adequada (quando aplicável)
3. Inclua casos de teste para validação de campos obrigatórios.
4. Inclua casos de teste para cada perfil de usuário listado, sempre que houver comportamentos distintos.
5. Seja detalhado nos passos — cada ação deve ser clara o suficiente para que qualquer pessoa execute o teste sem dúvidas.
6. Gere o resultado em formato Markdown, pronto para ser salvo em um arquivo `.md` dentro da pasta `docs/tests` do projeto.
# Visão Geral
Este servidor implementa uma API de sincronização de dados com suporte a gRPC e REST. Desenvolvido com NestJS e TypeORM, o servidor gerencia dados armazenados em um banco PostgreSQL e fornece endpoints para sincronização bidirecional com clientes.

## Funcionalidades
- **API Dual**: Suporte a gRPC e REST na mesma aplicação
- **Streaming de Dados**: Transferência eficiente de grandes conjuntos de dados
- **Processamento em Lote**: Otimizado para operações em massa
- **Geração de Dados**: Endpoint para criar dados de teste

## Tecnologias Utilizadas
- **NestJS**: Framework Node.js para aplicações escaláveis
- **TypeORM**: ORM para interação com o banco de dados
- **PostgreSQL**: Banco de dados relacional
- **gRPC**: Comunicação eficiente baseada em HTTP/2
- **REST**: API HTTP tradicional

## Estrutura do Projeto
```
person-api/
├── src/
│   ├── proto/
│   │   └── person.proto         # Definição do serviço gRPC
│   ├── person/
│   │   ├── entities/
│   │   │   └── person.entity.ts # Entidade do banco de dados
│   │   ├── interfaces/
│   │   │   └── person.interface.ts # Interfaces TypeScript
│   │   ├── person.controller.ts # Controlador para endpoints
│   │   ├── person.service.ts    # Serviço com lógica de negócio
│   │   └── person.module.ts     # Configuração do módulo
│   ├── app.module.ts            # Configuração da aplicação
│   └── main.ts                  # Ponto de entrada
└── package.json
```

## Como Executar
1. Certifique-se de ter Node.js e PostgreSQL instalados
2. Clone o repositório
3. Instale as dependências:
```bash
$ npm install
```
4. Configure a conexão com o banco de dados em app.module.ts
5. Execute o servidor:
```bash
# watch mode
$ npm run start:dev
```

## Endpoints
## gRPC
|Método	| Descrição|
|-------|----------|
|**GetAllPeople**|	Retorna todas as pessoas do banco|
|**UpdatePerson**|	Atualiza uma pessoa existente|
|**SavePerson**|	Salva uma nova pessoa|
|**SyncPeople**|	Sincroniza múltiplas pessoas|

## REST
|Endpoint |	Método |	Descrição |
|---------|--------|------------|
|**/api/person/rest/all**|	GET|	Retorna todas as pessoas|
|**/api/person/rest/update/:id**|	PUT|	Atualiza uma pessoa|
|**/api/person/generate-random**|	POST|	Gera pessoas com dados aleatórios|

## Otimizações
- Índices no Banco: Melhora a performance de consultas
- Processamento em Lote: Reduz overhead de comunicação
- Consultas Otimizadas: Usa QueryBuilder para consultas eficientes
- Logs de Performance: Monitora tempos de execução

 ## Configuração Avançada
Para otimizar a performance em ambientes de produção:
- Ajuste o tamanho dos lotes no processamento
- Configure o pool de conexões do PostgreSQL
- Ajuste os limites de tamanho de mensagem do gRPC
- Implemente cache para consultas frequentes

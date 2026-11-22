# Flow — Piloto (PEX V)

Execução preliminar do sistema **Flow**, desenvolvido para a profissional
autônoma Daiana Carvalho Borges (artesã de mandalas e instrutora de
yoga/treinamento funcional), conforme levantamento realizado nos Projetos de
Extensão I a IV.

Este piloto testa **dois módulos-chave**: **Alunos** (cadastro/consulta/edição)
e **Agenda** (agendamento de aulas), além do cadastro de **Usuários** de
acesso. Tudo é protegido por **login simples** e
usa um **ORM (Sequelize)** para representar as entidades como classes (models).

## Telas

| Tela          | O que faz                                                                                          |
|---------------|----------------------------------------------------------------------------------------------------|
| **Login**     | Acesso com e-mail e senha.                                                                         |
| **Alunos**    | Tela inicial após o login. Lista com busca por nome e quantidade de aulas já realizadas (só conta aulas cuja data e horário já passaram); cadastro, edição e remoção de alunos. O contato segue a máscara de telefone `(11) 98765-4321` (celular) ou `(11) 3456-7890` (fixo). |
| **Agenda**    | Semana em destaque (com a quantidade de aulas de cada dia), setas para avançar/voltar semanas e botão "Hoje"; aulas do dia selecionado; cadastro, edição e remoção de aulas. O horário é digitado (`HH:MM`) e o aluno é escolhido pesquisando pelo nome. Avisa quando já existe aula no mesmo dia e horário. |
| **Usuários**  | Lista de quem tem acesso ao sistema; cadastro de novos usuários (senha mínima de 6 caracteres, com confirmação) e remoção. Disponível apenas para quem já está logado. |

## Arquitetura

- **Backend**: Node.js + Express + Sequelize (ORM) + SQLite — API REST, um
  arquivo de rotas por módulo, entidades modeladas como classes em `models/`.
- **Frontend**: React + Vite — um componente por tela, sem dependências
  externas de UI, usando a paleta de cores definida no protótipo (PEX III).
- **Autenticação**: login simples (e-mail + senha) com hash de senha
  (bcrypt) e emissão de token JWT, exigido em todas as rotas exceto o login.

```
flow-system/
├── backend/
│   ├── db/
│   │   ├── sequelize.js   # instância/config do ORM (conexão SQLite)
│   │   └── seed.js        # dados de exemplo + usuário de acesso
│   ├── models/             # entidades como classes (ORM)
│   │   ├── Cliente.js
│   │   ├── Aula.js
│   │   ├── Usuario.js
│   │   └── index.js        # associações entre entidades
│   ├── middleware/
│   │   └── auth.js         # validação do token JWT
│   ├── routes/
│   │   ├── auth.js         # login
│   │   ├── alunos.js
│   │   ├── agenda.js
│   │   └── usuarios.js     # cadastro de usuários de acesso
│   ├── utils/
│   │   └── telefone.js     # padronização do telefone dos alunos
│   ├── server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Login.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Alunos.jsx
    │   │   ├── Agenda.jsx
    │   │   ├── Usuarios.jsx
    │   │   ├── Modal.jsx    # janela reutilizada nos formulários
    │   │   └── Icones.jsx
    │   ├── api.js           # chamadas à API
    │   ├── formatos.js      # máscara de telefone
    │   ├── styles.css
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Como executar

### 1. Backend

```bash
cd backend
npm install
npm run seed          # cria as tabelas via ORM, o usuário de acesso e dados de exemplo
npm start              # sobe em http://localhost:3001
```

O seeder cria a usuária padrão de acesso:

- **Nome:** Eduarda Telk
- **E-mail:** `eduardatelk@gmail.com`
- **Senha:** `123456`

Outros usuários podem ser cadastrados depois pela tela **Usuários**.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev           # sobe em http://localhost:5173
```

Abra `http://localhost:5173`, faça login e navegue
entre as telas pelo menu lateral.

> Alterações no frontend são recarregadas automaticamente pelo Vite. Alterações
> no backend exigem reiniciá-lo (`Ctrl + C` e `npm start`).

## ORM e Models

As entidades do esquema definido no PEX IV são representadas como classes
Sequelize em `backend/models/`:

- `Cliente` (tabela `clientes`) — nome e contato do aluno.
- `Aula` (tabela `aulas`) — data, horário, tipo de aula e vínculo (FK) com um `Cliente`.
- `Usuario` (tabela `usuarios`) — credenciais de acesso ao sistema.

As associações (`Cliente.hasMany(Aula)` / `Aula.belongsTo(Cliente)`) ficam
centralizadas em `backend/models/index.js`. `sequelize.sync()` cria as
tabelas automaticamente a partir dessas classes na primeira execução.

## Autenticação

- `POST /api/login` recebe `{ email, senha }` e retorna um token JWT válido
  por 8 horas. O e-mail não diferencia maiúsculas de minúsculas.
- As demais rotas exigem o cabeçalho `Authorization: Bearer <token>` (o
  frontend já cuida disso automaticamente após o login).
- As senhas são armazenadas com hash (bcrypt), nunca em texto puro, e nunca
  são devolvidas pela API.
- Novos usuários só podem ser criados por quem já está logado (não há
  cadastro aberto na tela de login), e um usuário não pode remover o próprio
  acesso.

## Regras de validação

- **Telefone do aluno**: precisa ter DDD + número (10 ou 11 dígitos). O
  backend salva sempre no formato `(11) 98765-4321` / `(11) 3456-7890`,
  independentemente de como o número foi digitado.
- **Horário da aula**: formato `HH:MM` entre `00:00` e `23:59`; formas curtas
  como `7:30` ou `9` são completadas para `07:30` e `09:00`.
- **Usuário**: nome, e-mail válido e senha com pelo menos 6 caracteres; o
  e-mail não pode se repetir.

## Endpoints da API (piloto)

| Método | Rota                 | Autenticação | Descrição                         |
|--------|----------------------|--------------|-----------------------------------|
| POST   | /api/login           | não          | Autentica e retorna o token       |
| GET    | /api/health          | não          | Verifica se a API está no ar      |
| GET    | /api/alunos          | sim          | Lista alunos (filtro `?busca=`)   |
| GET    | /api/alunos/:id      | sim          | Consulta um aluno                 |
| POST   | /api/alunos          | sim          | Cadastra um aluno                 |
| PUT    | /api/alunos/:id      | sim          | Edita um aluno                    |
| DELETE | /api/alunos/:id      | sim          | Remove um aluno                   |
| GET    | /api/agenda          | sim          | Lista aulas (filtro `?data=`)     |
| POST   | /api/agenda          | sim          | Agenda uma nova aula              |
| PUT    | /api/agenda/:id      | sim          | Edita uma aula                    |
| DELETE | /api/agenda/:id      | sim          | Remove um agendamento             |
| GET    | /api/usuarios        | sim          | Lista usuários de acesso          |
| POST   | /api/usuarios        | sim          | Cadastra um usuário de acesso     |
| DELETE | /api/usuarios/:id    | sim          | Remove um usuário de acesso       |

## Próximas etapas (pós-piloto)

- Implementar models e rotas de **Pedido**, **Pagamento** e **Alerta**, já
  modelados no PEX IV, seguindo o mesmo padrão ORM adotado aqui.
- Criar uma Dashboard com os indicadores previstos no protótipo (clientes
  ativos, aulas agendadas, pedidos pendentes e receitas do mês).
- Avaliar expiração/renovação de token, troca de senha pelo próprio usuário e
  tela de "esqueci minha senha".

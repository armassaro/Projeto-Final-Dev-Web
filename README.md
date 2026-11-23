# Inteligência contra evasão escolar

Sistema para professores do ensino fundamental e médio que estima o risco de evasão escolar de cada aluno (baixo, médio ou alto). O professor cadastra suas turmas e alunos e lança notas, faltas e entregas de atividades. A partir desses dados, da renda familiar e das observações do professor, a IA classifica o risco de cada aluno, aponta os fatores que pesaram na avaliação e sugere uma ação.

## Endereços públicos

| Parte | Endereço |
|---|---|
| Site | _a preencher após o deploy_ |
| API | _a preencher após o deploy_ |
| Documentação da API | _endereço da API_ + `/docs` |

Contas de demonstração, criadas sempre que a API inicia:

| E-mail | Senha |
|---|---|
| `helena@escola.edu.br` | `senha123` |
| `rafael@escola.edu.br` | `senha123` |

## Tecnologias

- **Frontend** (`frontend/`): Next.js exportado como site estático, React, TypeScript e Tailwind CSS.
- **Backend** (`backend/`): Python com FastAPI.
- **Autenticação**: JWT.
- **IA**: modelo Jev, chamado pelo SDK `typesafe-sdk`.
- **Dados**: em memória nesta etapa (`backend/storage.py`). A persistência com SQLModel entra na Sprint 4.

## Como executar localmente

São necessários Python 3.10 ou superior e Node.js 22 ou superior. Rode a API e o site em dois terminais.

### 1. Backend

Dentro da pasta `backend/`:

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux e macOS
pip install -r requirements.txt
cp .env.example .env          # no Windows: copy .env.example .env
```

Edite o `.env` e preencha pelo menos `SECRET_KEY`. **Sem ela, a API não inicia.** Para a análise de risco funcionar, preencha também `TYPESAFE_API_KEY`. Depois, inicie a API:

```bash
uvicorn main:app --reload
```

A API fica em http://localhost:8000 e a documentação interativa em http://localhost:8000/docs.

### 2. Frontend

Dentro da pasta `frontend/`:

```bash
npm install
cp .env.example .env.local    # no Windows: copy .env.example .env.local
npm run dev
```

Acesse http://localhost:3000 e entre com uma das contas de demonstração.

Para gerar a versão estática (pasta `frontend/out/`), use `npm run build`.

## Variáveis de ambiente

As chaves ficam fora do repositório: os arquivos `.env` estão no `.gitignore`, e cada pasta traz um `.env.example` com os nomes das variáveis.

### Backend (`backend/.env`)

| Variável | Descrição | Padrão |
|---|---|---|
| `SECRET_KEY` | Chave que assina os tokens JWT. Obrigatória | — |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Validade do token, em minutos | `480` |
| `CORS_ORIGINS` | Endereços do site que podem acessar a API, separados por vírgula | `http://localhost:3000` |
| `TYPESAFE_API_KEY` | Chave da API do Jev. Sem ela, a análise de risco responde 503 | — |
| `TYPESAFE_BASE_URL` | Endereço da API do Jev | `https://api.typesafe.ai` |
| `TYPESAFE_MODEL` | Modelo usado | `jev-latest` |
| `TYPESAFE_TIMEOUT_SECONDS` | Tempo máximo de espera por resposta da IA | `15` |
| `TYPESAFE_MAX_RETRIES` | Novas tentativas em caso de falha da IA | `2` |

### Frontend (`frontend/.env.local`)

| Variável | Descrição | Padrão |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Endereço da API | `http://localhost:8000` |

Como o site é exportado como estático, `NEXT_PUBLIC_API_URL` é lida no build. Depois de alterá-la, gere o site de novo.

## Autenticação

1. O professor faz login (`POST /auth/login`) ou cria uma conta (`POST /auth/register`), e a API devolve um token JWT.
2. O site guarda o token no `localStorage` e o envia em todas as requisições, no cabeçalho `Authorization: Bearer <token>`.
3. Todas as rotas de turmas, alunos, lançamentos e IA exigem o token. Cada professor só acessa os próprios dados; uma turma ou um aluno de outro professor responde 404.
4. Se a API responder 401 (token vencido ou inválido), o site encerra a sessão e volta para o login.

## Análise de risco com IA

Sempre que o professor abre o painel, a tela de turmas ou a de lançamentos, o site pede à API o risco de cada aluno (`POST /ia/alunos/{id}/risco`). A API envia ao Jev os dados do aluno: notas, faltas, entregas, renda familiar e observações. O Jev devolve:

- o nível de risco (baixo, médio ou alto) e uma pontuação de 0 a 100;
- os fatores presentes: notas baixas, faltas frequentes, entregas atrasadas, renda baixa ou observação preocupante;
- a ação sugerida ao professor.

Alunos sem nenhum lançamento aparecem como "Sem dados", sem consulta à IA. Depois de um novo lançamento, o risco daquele aluno é recalculado. Enquanto a IA responde, a tela mostra "Calculando..."; se a análise falhar, mostra o erro e um botão para tentar de novo. O último resultado de cada aluno fica no `sessionStorage` e é apagado no logout.

## Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastra um professor e devolve o token |
| POST | `/auth/login` | Confere e-mail e senha e devolve o token |
| GET | `/auth/me` | Dados do professor logado |
| GET, POST | `/turmas` | Lista e cria turmas do professor |
| POST | `/turmas/{id}/importar` | Importa notas, faltas e entregas de outros períodos |
| GET, POST | `/alunos` | Lista (opcionalmente por `classroom_id`) e cadastra alunos |
| GET, PATCH | `/alunos/{id}` | Consulta e edita um aluno |
| GET | `/alunos/{id}/lancamentos` | Notas, faltas e entregas de um aluno |
| GET | `/lancamentos` | Notas, faltas e entregas de todos os alunos do professor |
| POST | `/notas`, `/faltas`, `/entregas` | Registra lançamentos |
| POST | `/ia/alunos/{id}/risco` | Calcula com a IA o risco de evasão de um aluno |
| GET | `/ia/exemplos` | Lista alunos de exemplo para testar a IA |
| POST | `/ia/exemplos/{id}/risco` | Calcula o risco de um aluno de exemplo |

Só `/auth/register`, `/auth/login` e `/` (verificação de status) dispensam o token.

## Estrutura do repositório

```
backend/
  main.py          cria a aplicação, configura o CORS e registra as rotas
  config.py        leitura das variáveis de ambiente
  auth/            senhas, criação e leitura do token JWT
  routers/         rotas da API
  schemas/         validação dos dados de entrada e saída
  services/        integração com a IA (Jev)
  storage.py       armazenamento em memória
  seed.py          dados iniciais
frontend/src/
  app/             páginas: login, painel, turmas e lançamentos
  components/      componentes agrupados por assunto (auth, classrooms, students, records, risk, ui)
  contexts/        AuthContext (sessão) e DataContext (dados escolares)
  hooks/           useForm, useTeacherData e useRiskAssessments
  services/        chamadas à API, formatação e importação de JSON
  types/           tipos compartilhados
render.yaml        publicação da API e do site no Render
```

## Publicação no Render

O `render.yaml` cria dois serviços: a API em Python e o site estático. No painel do Render, escolha **New > Blueprint** e selecione este repositório. Na criação, o painel pede:

- `CORS_ORIGINS`: endereço do site, sem barra no final;
- `TYPESAFE_API_KEY`: chave da API do Jev;
- `NEXT_PUBLIC_API_URL`: endereço da API.

O Render gera `SECRET_KEY` automaticamente. No plano gratuito, a API "dorme" quando fica sem uso, e o primeiro acesso pode levar até um minuto; nesse tempo, o site mostra uma mensagem de carregamento. Como os dados ficam em memória, voltam ao estado inicial sempre que a API reinicia.

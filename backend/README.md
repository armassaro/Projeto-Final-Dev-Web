# Backend

API em FastAPI que atende o frontend do sistema.

## Visão geral da aplicação

Sistema para professores do ensino fundamental e médio que estima o risco de evasão escolar de cada aluno (baixo, médio ou alto) a partir de notas, faltas, entregas, renda familiar e observações do professor.

### Frontend (`frontend/`): Next.js, React, TypeScript e Tailwind

- **Páginas** (`src/app/`):
  - `login`: login e cadastro de professor.
  - `turmas`: turmas e alunos.
  - `lancamentos`: notas, faltas e entregas.
  - `painel`: visão geral dos riscos.
- **Componentes** (`src/components/`):
  - `auth`: formulários de login e cadastro.
  - `classrooms`: turmas.
  - `students`: cadastro e detalhe do aluno, além da importação de dados de outros períodos.
  - `records`: formulários de nota, falta e entrega.
  - `risk`: selo, resumo e contadores de risco.
  - `ui`: componentes genéricos.
- **Estado** (`src/contexts/`): `AuthContext` cuida do login e `DataContext` dos dados escolares, salvos no `localStorage` do navegador. Os dados iniciais vêm de `src/data/mock.ts`.
- **Cálculo de risco** (`src/services/risk.ts`): dá mais peso às notas do semestre atual e devolve uma sugestão de ação para cada nível de risco.
- **Publicação**: o site é exportado como páginas estáticas, na pasta `out/`.

### Backend (`backend/`): API em FastAPI com Python

- **Rotas** (`routers/`): `auth` (cadastro e login de professor), `turmas` (turmas e importação de dados de outros períodos), `alunos` (cadastro e consulta de alunos), `lancamentos` (notas, faltas e entregas) e `ia` (avaliação de risco).
- **Validação** (`schemas/`): confere os dados de entrada e saída. O schema de aluno guarda a confiança da resposta da IA.
- **IA** (`services/`): a avaliação usa o modelo Jev, chamado pelo SDK `typesafe_sdk`. O modelo devolve um nível de 0 a 4 e indica quais fatores de risco estão presentes: notas baixas, faltas, atrasos, renda baixa ou observação do professor.
- **Dados**: ficam em memória (`storage.py`) e são carregados a partir de `seed.py` quando a API inicia.

### Publicação

O `render.yaml` na raiz do repositório cria dois serviços no Render: a API em Python e o site estático. A chave da API do Jev é preenchida no painel do Render.

## Como executar

Requer Python 3.10 ou superior. Os comandos abaixo são executados dentro da pasta `backend/`.

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

A API fica em http://localhost:8000 e a documentação interativa em http://localhost:8000/docs.

Os dados ficam em memória nesta etapa e voltam ao estado inicial sempre que a API reinicia. Ao iniciar, a API carrega as mesmas turmas, alunos e lançamentos do frontend, e as contas de demonstração continuam valendo (`helena@escola.edu.br` / `senha123`).

## Variáveis de ambiente

O arquivo `.env.example` lista as variáveis aceitas. Para mudar algum valor, copie o arquivo para `.env` e edite. Sem o `.env`, os valores padrão são usados.

| Variável | Descrição | Padrão |
|---|---|---|
| `CORS_ORIGINS` | Endereços do frontend que podem acessar a API, separados por vírgula | `http://localhost:3000` |


## Rotas

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastra um professor |
| POST | `/auth/login` | Confere e-mail e senha |
| GET | `/auth/me` | Dados do professor logado |
| GET, POST | `/turmas` | Lista e cria turmas do professor |
| POST | `/turmas/{id}/importar` | Importa notas, faltas e entregas de outros períodos |
| GET, POST | `/alunos` | Lista (opcionalmente por `classroom_id`) e cadastra alunos |
| GET, PATCH | `/alunos/{id}` | Consulta e edita um aluno |
| GET | `/alunos/{id}/lancamentos` | Notas, faltas e entregas de um aluno |
| POST | `/notas`, `/faltas`, `/entregas` | Registra lançamentos |

## Estrutura

- `main.py`: cria a aplicação, configura o CORS e registra as rotas
- `config.py`: leitura das variáveis de ambiente
- `routers/`: rotas da API
- `schemas/`: validação dos dados de entrada e saída
- `auth/`: senhas e identificação do professor
- `storage.py`: armazenamento em memória
- `seed.py`: dados iniciais

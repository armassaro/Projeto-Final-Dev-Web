# Backend

API em FastAPI que atende o frontend do sistema.

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

# Backend

API em FastAPI do sistema Inteligência contra evasão escolar. A visão geral do sistema, as variáveis de ambiente e a lista completa de rotas estão no [README da raiz](../README.md).

## Como executar

Requer Python 3.10 ou superior. Os comandos abaixo são executados dentro da pasta `backend/`.

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Linux e macOS
pip install -r requirements.txt
cp .env.example .env          # no Windows: copy .env.example .env
```

Preencha `SECRET_KEY` no `.env` (obrigatória) e, para a análise de risco, `TYPESAFE_API_KEY`. Depois:

```bash
uvicorn main:app --reload
```

A API fica em http://localhost:8000 e a documentação interativa em http://localhost:8000/docs.

Os dados ficam em memória nesta etapa e voltam ao estado inicial sempre que a API reinicia. Ao iniciar, a API carrega turmas, alunos e lançamentos de demonstração (`seed.py`), com as contas `helena@escola.edu.br` e `rafael@escola.edu.br` (senha `senha123`).

## Estrutura

- `main.py`: cria a aplicação, configura o CORS e registra as rotas
- `config.py`: leitura das variáveis de ambiente
- `auth/`: senhas (bcrypt), criação e leitura do token JWT e a dependência `CurrentTeacher`, que protege as rotas
- `routers/`: rotas de autenticação, turmas, alunos, lançamentos e IA
- `schemas/`: validação dos dados de entrada e saída, em camelCase para casar com os tipos do frontend
- `services/`: integração com o Jev. `jev_risco.py` monta as perguntas enviadas à IA e converte a resposta em nível, pontuação, fatores e ação sugerida
- `storage.py`: armazenamento em memória
- `seed.py`: dados iniciais

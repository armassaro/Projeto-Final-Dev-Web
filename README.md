# Inteligência contra evasão escolar

Sistema web para professores do ensino fundamental e médio acompanharem o Inteligência contra evasão escolar dos alunos.

## Dupla

- A preencher
- A preencher

## Descrição do sistema

**Problema:** cálculo de Inteligência contra evasão escolar considerando faltas, notas e entregas, para sugerir ações com base nos dados.

**Sistema proposto:** uma base que unifica notas de atividades e provas, faltas, datas de entrega e renda familiar. Os dados são analisados por um modelo de tomada de decisão de baixo custo, com possibilidade de importar dados de outros períodos, para classificar o risco do aluno como baixo, médio ou alto. O risco é recalculado a cada nova nota e considera principalmente o histórico do último semestre. O professor também pode adicionar observações que afetam o cálculo.

**Público-alvo:** professores do ensino fundamental e médio.

## Estado atual: Sprint 2 (em andamento)

O projeto tem duas partes:

- **Frontend** (`frontend/`): Next.js com dados mockados salvos no `localStorage` do navegador. O login é simulado e o cálculo de risco em `frontend/src/services/risk.ts` ainda é uma regra provisória. O frontend ainda não consome a API.
- **Backend** (`backend/`): API em FastAPI com cadastro e login de professores, turmas, alunos, lançamentos (notas, faltas e entregas) e importação de dados de outros períodos. Os dados ficam em memória e voltam ao estado inicial sempre que a API reinicia; ao iniciar, ela carrega as mesmas turmas, alunos e lançamentos do frontend.
- **Modelo de IA**: já existe um cliente para a API do Jev (`backend/services/`), que vai substituir a regra provisória de risco e informar a confiança da classificação. Ele ainda não está ligado às rotas.

## Telas

- `/login`: login e cadastro de professor
- `/turmas`: turmas, alunos, observações e importação de JSON
- `/lancamentos`: notas, faltas e entregas
- `/painel`: risco por aluno, filtros e detalhes

Conta de demonstração (frontend e API): `helena@escola.edu.br` / `senha123`. Um arquivo de exemplo para importação está em `frontend/public/exemplo-importacao.json`.

## Como executar

### Backend

Requer Python 3.10 ou superior. Os comandos abaixo são executados dentro da pasta `backend/`.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Linux/macOS
.venv\Scripts\activate         # Windows
pip install -r requirements.txt
cp .env.example .env           # opcional: só se for mudar algum valor
uvicorn main:app --reload
```

A API fica em http://localhost:8000 e a documentação interativa em http://localhost:8000/docs.

#### Variáveis de ambiente

Sem o arquivo `.env`, os valores padrão são usados.

| Variável | Descrição | Padrão |
|---|---|---|
| `CORS_ORIGINS` | Endereços do frontend que podem acessar a API, separados por vírgula | `http://localhost:3000` |
| `TYPESAFE_API_KEY` | Chave da API do Jev (modelo de risco) | vazio |
| `TYPESAFE_BASE_URL` | URL da API do Jev (precisa ser HTTPS) | `https://api.typesafe.ai` |
| `TYPESAFE_MODEL` | Modelo usado | `jev-latest` |
| `TYPESAFE_TIMEOUT_SECONDS` | Tempo limite de cada requisição | `15` |
| `TYPESAFE_MAX_RETRIES` | Novas tentativas em caso de falha temporária | `2` |

Rotas, estrutura de pastas e mais detalhes estão em [`backend/README.md`](backend/README.md).

### Frontend

Requer Node.js 20.9 ou superior.

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:3000.

#### Versão estática

```bash
cd frontend
npm run build
npm start
```

O build gera a versão estática na pasta `frontend/out/`, que pode ser publicada em qualquer hospedagem de arquivos estáticos.

## Hospedagem no Render

O arquivo `render.yaml` na raiz cria os dois serviços de uma vez:

- `evasao-escolar-api`: a API, com a documentação em `/docs`
- `evasao-escolar-web`: o frontend como site estático

Passos:

1. Envie o repositório para o GitHub.
2. No Render, clique em **New > Blueprint** e selecione o repositório.
3. Preencha as variáveis pedidas no painel:
   - `TYPESAFE_API_KEY`: chave da API do Jev
   - `CORS_ORIGINS`: endereço do frontend, por exemplo `https://evasao-escolar-web.onrender.com`
4. Confirme a criação. A cada `push` na `main`, os dois serviços são atualizados.

No plano gratuito, a API "dorme" depois de 15 minutos sem uso e demora cerca de 1 minuto para responder à primeira requisição. Como os dados ficam em memória, eles voltam ao estado inicial sempre que ela reinicia.

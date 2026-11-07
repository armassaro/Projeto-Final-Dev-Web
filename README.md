# Inteligência contra evasão escolar

Sistema web para professores do ensino fundamental e médio acompanharem o Inteligência contra evasão escolar dos alunos.

## Dupla

- A preencher
- A preencher

## Descrição do sistema

**Problema:** cálculo de Inteligência contra evasão escolar considerando faltas, notas e entregas, para sugerir ações com base nos dados.

**Sistema proposto:** uma base que unifica notas de atividades e provas, faltas, datas de entrega e renda familiar. Os dados são analisados por um modelo de tomada de decisão de baixo custo, com possibilidade de importar dados de outros períodos, para classificar o risco do aluno como baixo, médio ou alto. O risco é recalculado a cada nova nota e considera principalmente o histórico do último semestre. O professor também pode adicionar observações que afetam o cálculo.

**Público-alvo:** professores do ensino fundamental e médio.

## Estado atual: Sprint 1

Apenas o frontend está implementado, com dados mockados salvos no `localStorage` do navegador. O login é simulado e o cálculo de risco em `frontend/src/services/risk.ts` é uma regra provisória, que será substituída pelo modelo de IA na Sprint 2.

## Telas

- `/login`: login e cadastro de professor
- `/turmas`: turmas, alunos, observações e importação de JSON
- `/lancamentos`: notas, faltas e entregas
- `/painel`: risco por aluno, filtros e detalhes

Conta de demonstração: `helena@escola.edu.br` / `senha123`. Um arquivo de exemplo para importação está em `frontend/public/exemplo-importacao.json`.

## Como executar

Requer Node.js 20.9 ou superior.

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:3000.

## Versão estática

```bash
cd frontend
npm run build
npm start
```

O build gera a versão estática na pasta `frontend/out/`, que pode ser publicada em qualquer hospedagem de arquivos estáticos.

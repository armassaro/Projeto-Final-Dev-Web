"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { useData } from "@/contexts/DataContext";
import { parseImportJson } from "@/services/import";

type Result = { message: string; errors: string[]; success: boolean };

export function DataImport({ classroomId }: { classroomId: string }) {
  const { importRows } = useData();
  const [result, setResult] = useState<Result | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    const { rows, errors } = parseImportJson(await file.text());
    input.value = "";
    if (rows.length === 0) {
      setResult({ message: "Nenhum registro válido encontrado.", errors, success: false });
      return;
    }
    const { added, duplicates } = importRows(classroomId, rows);
    setResult({
      message: `${added} registro(s) importado(s), ${duplicates} duplicado(s) ignorado(s), ${errors.length} com erro.`,
      errors,
      success: true,
    });
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-slate-600">
        Importe dados de outros períodos para a turma selecionada, em um arquivo JSON com uma lista
        de registros. Campos: <code>aluno, tipo, descricao, data, nota, prazo</code>. Tipos:
        atividade, prova, falta ou entrega. Datas no formato AAAA-MM-DD. Na entrega, omita a data se
        não foi realizada. Alunos novos são criados na turma.{" "}
        <a className="underline" href="/exemplo-importacao.json" download>
          Baixar exemplo
        </a>
      </p>
      <input type="file" accept=".json,application/json" aria-label="Arquivo JSON" onChange={handleFile} />
      {result && (
        <Alert tone={result.success ? "success" : "error"}>
          <p>{result.message}</p>
          {result.errors.length > 0 && (
            <ul className="mt-1 list-disc pl-4">
              {result.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}
    </div>
  );
}

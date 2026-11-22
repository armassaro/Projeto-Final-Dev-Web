"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, describeError } from "@/services/api";
import { loadFromStorage, saveToStorage } from "@/services/storage";
import type { RiskAssessment, RiskState, Student, StudentRecords } from "@/types";

/** Quantas análises de IA podem estar em andamento ao mesmo tempo. */
const MAX_PARALLEL_REQUESTS = 4;

type Settled = { version: string; state: RiskState };

/** Resultados da IA guardados no sessionStorage, por aluno. */
type RiskCache = Record<string, { version: string; assessment: RiskAssessment }>;

/** Prefixo das chaves do cache; o AuthContext apaga essas chaves no logout. */
export const RISK_CACHE_PREFIX = "evasao:risco:";

/**
 * Identifica os dados usados no cálculo. Quando o aluno ou os lançamentos mudam,
 * a versão muda e o risco é pedido de novo à IA.
 */
function dataVersion(student: Student, records: StudentRecords): string {
  return JSON.stringify([
    student.familyIncome,
    student.observations,
    student.observationImpact,
    records.grades.map((grade) => grade.id),
    records.absences.map((absence) => absence.id),
    records.deliveries.map((delivery) => delivery.id),
  ]);
}

/**
 * Pede à API o risco de evasão de cada aluno, calculado pela IA.
 * Cada vez que a página que usa o hook é aberta, todos os riscos são recalculados.
 */
export function useRiskAssessments(
  students: Student[],
  getRecords: (studentId: string) => StudentRecords,
  teacherId: string | undefined,
) {
  const [settled, setSettled] = useState<Record<string, Settled>>({});
  const cacheKey = teacherId ? `${RISK_CACHE_PREFIX}${teacherId}` : null;
  // Último resultado salvo na sessão: exibido enquanto a IA recalcula.
  const cached = useMemo(
    () => (cacheKey ? (loadFromStorage<RiskCache>(cacheKey, "session") ?? {}) : {}),
    [cacheKey],
  );
  // Versão dos dados pedida por último para cada aluno, e o pedido em vigor.
  const requestedVersion = useRef(new Map<string, string>());
  const currentRequest = useRef(new Map<string, number>());
  const nextRequestId = useRef(0);
  const queue = useRef<(() => Promise<void>)[]>([]);
  const running = useRef(0);
  const mounted = useRef(true);

  // Mantém no máximo MAX_PARALLEL_REQUESTS "trabalhadores" consumindo a fila.
  const runQueue = useCallback(() => {
    const worker = async () => {
      let task = queue.current.shift();
      while (task) {
        await task();
        task = queue.current.shift();
      }
      running.current -= 1;
    };
    while (running.current < MAX_PARALLEL_REQUESTS && queue.current.length > 0) {
      running.current += 1;
      void worker();
    }
  }, []);

  const request = useCallback(
    (studentId: string, version: string) => {
      const requestId = ++nextRequestId.current;
      requestedVersion.current.set(studentId, version);
      currentRequest.current.set(studentId, requestId);
      const isCurrent = () => mounted.current && currentRequest.current.get(studentId) === requestId;

      queue.current.push(async () => {
        // Ignora pedidos que ficaram velhos enquanto esperavam na fila.
        if (!isCurrent()) return;
        let state: RiskState;
        try {
          state = { status: "ready", assessment: await api.assessRisk(studentId) };
        } catch (error) {
          state = { status: "error", message: describeError(error) };
        }
        if (!isCurrent()) return;
        setSettled((current) => ({ ...current, [studentId]: { version, state } }));
        if (cacheKey && state.status === "ready") {
          const cache = loadFromStorage<RiskCache>(cacheKey, "session") ?? {};
          cache[studentId] = { version, assessment: state.assessment };
          saveToStorage(cacheKey, cache, "session");
        }
      });
      runQueue();
    },
    [runQueue, cacheKey],
  );

  useEffect(() => {
    const versions = requestedVersion.current;
    const requests = currentRequest.current;
    const pending = queue.current;
    mounted.current = true;
    return () => {
      // Descarta pedidos pendentes: ao voltar à página, tudo é pedido de novo.
      mounted.current = false;
      pending.length = 0;
      versions.clear();
      requests.clear();
    };
  }, []);

  useEffect(() => {
    for (const student of students) {
      const version = dataVersion(student, getRecords(student.id));
      if (requestedVersion.current.get(student.id) !== version) request(student.id, version);
    }
  }, [students, getRecords, request]);

  const getRisk = useCallback(
    (student: Student): RiskState => {
      const result = settled[student.id];
      const version = dataVersion(student, getRecords(student.id));
      if (result && result.version === version) return result.state;
      const saved = cached[student.id];
      if (saved && saved.version === version) return { status: "ready", assessment: saved.assessment };
      return { status: "loading" };
    },
    [settled, cached, getRecords],
  );

  /** Pede de novo o risco de um aluno (usado após uma falha). */
  const retry = useCallback(
    (student: Student) => {
      const version = dataVersion(student, getRecords(student.id));
      setSettled((current) => {
        const next = { ...current };
        delete next[student.id];
        return next;
      });
      request(student.id, version);
    },
    [getRecords, request],
  );

  return { getRisk, retry };
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { mockTeachers } from "@/data/mock";
import { createId } from "@/services/format";
import { loadFromStorage, saveToStorage } from "@/services/storage";
import type { Teacher } from "@/types";

const TEACHERS_KEY = "evasao:professores";
const SESSION_KEY = "evasao:sessao";

type RegisterInput = Pick<Teacher, "name" | "email" | "password">;

type AuthContextValue = {
  user: Teacher | null;
  ready: boolean;
  login: (email: string, password: string) => string | null;
  register: (input: RegisterInput) => string | null;
  logout: () => void;
};

type AuthState = {
  teachers: Teacher[];
  userId: string | null;
  ready: boolean;
};

const INITIAL_STATE: AuthState = { teachers: mockTeachers, userId: null, ready: false };

function reducer(state: AuthState, patch: Partial<AuthState>): AuthState {
  return { ...state, ...patch };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ teachers, userId, ready }, dispatch] = useReducer(reducer, INITIAL_STATE);

  useEffect(() => {
    dispatch({
      teachers: loadFromStorage<Teacher[]>(TEACHERS_KEY) ?? mockTeachers,
      userId: loadFromStorage<string>(SESSION_KEY),
      ready: true,
    });
  }, []);

  const startSession = useCallback((id: string) => {
    dispatch({ userId: id });
    saveToStorage(SESSION_KEY, id);
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      const teacher = teachers.find(
        (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
      );
      if (!teacher || teacher.password !== password) {
        return "E-mail ou senha incorretos.";
      }
      startSession(teacher.id);
      return null;
    },
    [teachers, startSession],
  );

  const register = useCallback(
    (input: RegisterInput) => {
      const email = input.email.trim().toLowerCase();
      if (teachers.some((item) => item.email.toLowerCase() === email)) {
        return "Já existe um professor com este e-mail.";
      }
      const teacher: Teacher = { ...input, id: createId(), name: input.name.trim(), email };
      const updated = [...teachers, teacher];
      dispatch({ teachers: updated });
      saveToStorage(TEACHERS_KEY, updated);
      startSession(teacher.id);
      return null;
    },
    [teachers, startSession],
  );

  const logout = useCallback(() => {
    dispatch({ userId: null });
    saveToStorage(SESSION_KEY, null);
  }, []);

  const value = useMemo(
    () => ({
      user: teachers.find((item) => item.id === userId) ?? null,
      ready,
      login,
      register,
      logout,
    }),
    [teachers, userId, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

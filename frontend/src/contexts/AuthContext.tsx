"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, api, describeError, setApiTeacher } from "@/services/api";
import { loadFromStorage, saveToStorage } from "@/services/storage";
import type { Teacher } from "@/types";

const SESSION_KEY = "evasao:sessao";

type RegisterInput = { name: string; email: string; password: string };

type AuthContextValue = {
  user: Teacher | null;
  ready: boolean;
  /** Devolve a mensagem de erro, ou null em caso de sucesso. */
  login: (email: string, password: string) => Promise<string | null>;
  register: (input: RegisterInput) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Teacher | null>(null);
  const [ready, setReady] = useState(false);

  const startSession = useCallback((teacher: Teacher | null) => {
    setApiTeacher(teacher?.id ?? null);
    saveToStorage(SESSION_KEY, teacher?.id ?? null);
    setUser(teacher);
  }, []);

  useEffect(() => {
    const storedId = loadFromStorage<string>(SESSION_KEY);
    setApiTeacher(storedId);
    const restore = storedId
      ? api
          .me()
          .then(startSession)
          .catch((error) => {
            // Só descarta a sessão salva se a API recusou o professor (ex.: a API reiniciou).
            if (error instanceof ApiError && error.status === 401) startSession(null);
            else setApiTeacher(null);
          })
      : Promise.resolve();
    void restore.finally(() => setReady(true));
  }, [startSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        startSession(await api.login(email.trim(), password));
        return null;
      } catch (error) {
        return describeError(error);
      }
    },
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      try {
        await api.register({ ...input, name: input.name.trim(), email: input.email.trim() });
        startSession(await api.login(input.email.trim(), input.password));
        return null;
      } catch (error) {
        return describeError(error);
      }
    },
    [startSession],
  );

  const logout = useCallback(() => startSession(null), [startSession]);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
}

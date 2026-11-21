"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, api, describeError, setApiToken, setUnauthorizedHandler } from "@/services/api";
import type { AuthSession } from "@/services/api";
import { loadFromStorage, saveToStorage } from "@/services/storage";
import type { Teacher } from "@/types";

const TOKEN_KEY = "evasao:token";

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

  const startSession = useCallback((token: string | null, teacher: Teacher | null) => {
    setApiToken(token);
    saveToStorage(TOKEN_KEY, token);
    setUser(teacher);
  }, []);

  const openSession = useCallback(
    (session: AuthSession) => startSession(session.access_token, session.teacher),
    [startSession],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => startSession(null, null));
    return () => setUnauthorizedHandler(null);
  }, [startSession]);

  useEffect(() => {
    const storedToken = loadFromStorage<string>(TOKEN_KEY);
    setApiToken(storedToken);
    const restore = storedToken
      ? api
          .me()
          .then((teacher) => startSession(storedToken, teacher))
          .catch((error) => {
            // Só descarta o token salvo se a API recusou (vencido ou inválido).
            if (error instanceof ApiError && error.status === 401) startSession(null, null);
            else setApiToken(null);
          })
      : Promise.resolve();
    void restore.finally(() => setReady(true));
  }, [startSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        openSession(await api.login(email.trim(), password));
        return null;
      } catch (error) {
        return describeError(error);
      }
    },
    [openSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      try {
        openSession(
          await api.register({ ...input, name: input.name.trim(), email: input.email.trim() }),
        );
        return null;
      } catch (error) {
        return describeError(error);
      }
    },
    [openSession],
  );

  const logout = useCallback(() => startSession(null, null), [startSession]);

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

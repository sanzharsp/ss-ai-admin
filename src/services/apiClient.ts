"use client"; // Директива говорит Next.js, что этот код исполняется в браузере (клиент)
import { getSession } from "next-auth/react";

import axios from "axios";

// Здесь только публичная переменная
const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const clientApiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Интерцептор для клиента
clientApiClient.interceptors.request.use(
  async (config) => {
    try {
      // В клиентском окружении (браузере) используем next-auth/react
      const session = await getSession();
      if (session?.user?.access_token) {
        config.headers.Authorization = `Bearer ${session?.user?.access_token}`;
      }

      return config;
    } catch (error) {
      console.error("Ошибка при получении сессии на клиенте:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

"use server";
import axios from "axios";
import {env} from "@/core/data/env/server";
import {auth} from "@/auth";



export const apiClient = axios.create({
    baseURL: env.API_URL, // Replace with your API URL
    headers: {
        "Content-Type": "application/json",
    },
});



apiClient.interceptors.request.use(
    async (config) => {
      try {
        const session = await auth();
 
        // Например, если accessToken хранится в session.accessToken:
        if (session && session.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
  
        // Или, если ваш токен лежит в session.user.accessToken:
        // if (session && session.user?.accessToken) {
        //   config.headers.Authorization = `Bearer ${session.user.accessToken}`;
        // }
        
        return config;
      } catch (error) {
        console.error("Ошибка при получении сессии:", error);
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );
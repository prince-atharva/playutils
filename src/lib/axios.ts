'use client'

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import { signOut } from 'next-auth/react'

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class Api {
  private instance: AxiosInstance
  constructor() {
    this.instance = axios.create({
      baseURL: '/v1/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => { 
        return config
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError) => {
        if (error.response) {
          const { status, data } = error.response
          if (status === 401) {
            await signOut();
          }
          throw new ApiError(
            status,
            (data as { error?: string })?.error || 'Something went wrong',
            data
          )
        }
        throw new ApiError(500, 'Network error')
      }
    )
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }
}

export const api = new Api() 
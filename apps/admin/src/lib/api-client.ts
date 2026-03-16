interface ApiRequestOptions extends RequestInit {
  token?: string
}

class AdminApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    // 브라우저에서는 상대 경로 사용 (Next.js rewrite가 backend로 프록시)
    // NEXT_PUBLIC_API_URL은 서버사이드/Docker 내부용이므로 클라이언트에서 사용하면 안 됨
    this.baseUrl = baseUrl || ''
  }

  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (fetchOptions.headers && typeof fetchOptions.headers === 'object' && !Array.isArray(fetchOptions.headers)) {
      Object.assign(headers, fetchOptions.headers)
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `API error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      console.error(`API request failed: ${url}`, error)
      throw error
    }
  }

  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

export const adminApiClient = new AdminApiClient()

import { useState, useCallback } from 'react'

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export function usePagination(initialPageSize: number = 10) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
  })

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
  }, [])

  const setTotal = useCallback((total: number) => {
    setPagination((prev) => ({ ...prev, total }))
  }, [])

  const totalPages = Math.ceil(pagination.total / pagination.pageSize)

  return {
    ...pagination,
    totalPages,
    setPage,
    setPageSize,
    setTotal,
  }
}

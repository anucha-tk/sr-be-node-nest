import { useState, useEffect, useCallback } from 'react'
import { fetchApi } from '../api'

export type SearchResult = {
  id: string
  type: 'invoice' | 'api-key' | 'supplier' | 'action'
  title?: string
  description?: string
  invoiceNumber?: string
  name?: string
  status?: string
  amount?: number
  createdAt?: string
  metadata?: Record<string, unknown>
}

export function useCommandPalette(setActiveTab?: (tab: string) => void) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Toggle with Cmd+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isOpen])

  // Search logic
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetchApi<{ hits: SearchResult[] }>(`/api/v1/search?q=${encodeURIComponent(query)}`)
        if (response.success && response.data) {
          setResults(response.data.hits)
          setSelectedIndex(0)
        } else {
          setError(typeof response.error === 'string' ? response.error : 'Search failed')
        }
      } catch (err) {
        console.error('Search error:', err)
        setError('Connection failed')
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback((result: SearchResult) => {
    console.log('Selected:', result)
    setIsOpen(false)
    setQuery('')
    if (!setActiveTab) return

    if (result.type === 'invoice') {
      setActiveTab('audit')
    } else if (result.type === 'api-key' || result.type === 'supplier') {
      setActiveTab('security')
    }
  }, [setActiveTab])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = results[selectedIndex]
        if (selected) {
          handleSelect(selected)
        }
      }
    },
    [results, selectedIndex, handleSelect]
  )

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    results,
    setResults,
    isLoading,
    error,
    selectedIndex,
    handleKeyDown,
    handleSelect,
  }
}

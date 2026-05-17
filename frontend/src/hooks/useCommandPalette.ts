import { useState, useEffect, useCallback } from 'react'
import { fetchApi } from '../api'
import { PAGES } from '../config/pages'

export type SearchResult = {
  id: string
  type: 'invoice' | 'api-key' | 'supplier' | 'action'
  title?: string
  description?: string
  invoiceNumber?: string
  name?: string
  supplierName?: string
  status?: string
  amount?: number
  createdAt?: string
  metadata?: Record<string, unknown>
}

export function useCommandPalette(
  setActiveTab?: (tab: string) => void,
  onLaunchDemo?: () => void
) {
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
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      setError(null)
      return
    }

    // In-memory PAGES search
    const queryLower = query.toLowerCase().trim()
    const matchedPages = PAGES.filter(
      (page) =>
        page.title.toLowerCase().includes(queryLower) ||
        page.desc.toLowerCase().includes(queryLower) ||
        page.subLabel.toLowerCase().includes(queryLower) ||
        page.keywords.some((kw) => kw.toLowerCase().includes(queryLower))
    )

    const pageResults: SearchResult[] = matchedPages.map((page) => ({
      id: page.id,
      type: 'action',
      title: page.title,
      description: page.subLabel,
    }))

    // Instantly set in-memory results and clear error
    setResults(pageResults)
    setSelectedIndex(0)
    setIsLoading(true)
    setError(null)

    const search = async () => {
      try {
        const response = await fetchApi<{ hits: SearchResult[] }>(
          `/api/v1/search?q=${encodeURIComponent(query)}`
        )
        if (response.success && response.data) {
          const apiHits = response.data.hits
          // Merge matched pages first, then API hits
          setResults([...pageResults, ...apiHits])
          setSelectedIndex(0)
        } else {
          // If API fails, only error if no local matched pages
          if (pageResults.length === 0) {
            setError(typeof response.error === 'string' ? response.error : 'Search failed')
          }
        }
      } catch (err) {
        console.error('Search error:', err)
        if (pageResults.length === 0) {
          setError('Connection failed')
        }
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(search, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = useCallback(
    (result: SearchResult) => {
      console.log('Selected:', result)
      setIsOpen(false)
      setQuery('')

      if (result.type === 'action') {
        if (result.id === 'presentation') {
          if (onLaunchDemo) onLaunchDemo()
        } else if (setActiveTab) {
          setActiveTab(result.id)
        }
      } else if (setActiveTab) {
        if (result.type === 'invoice') {
          setActiveTab('audit')
        } else if (result.type === 'api-key' || result.type === 'supplier') {
          setActiveTab('security')
        }
      }
    },
    [setActiveTab, onLaunchDemo]
  )

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

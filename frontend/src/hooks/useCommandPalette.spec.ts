import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useCommandPalette } from './useCommandPalette'

// Mock fetchApi
vi.mock('../api', () => ({
  fetchApi: vi.fn(),
}))

import { fetchApi } from '../api'

describe('useCommandPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should toggle open/closed state', () => {
    const { result } = renderHook(() => useCommandPalette())
    
    expect(result.current.isOpen).toBe(false)
    
    act(() => {
      result.current.setIsOpen(true)
    })
    expect(result.current.isOpen).toBe(true)
  })

  it('should search when query changes with debounce', async () => {
    const mockData = { success: true, data: { hits: [{ id: '1', title: 'Test result' }] } }
    vi.mocked(fetchApi).mockResolvedValue(mockData as any) // eslint-disable-line @typescript-eslint/no-explicit-any

    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      result.current.setQuery('test')
    })

    // Should not call immediately due to debounce
    act(() => {
      vi.advanceTimersByTime(350)
    })

    expect(fetchApi).toHaveBeenCalledWith('/api/v1/search?q=test')
  })

  it('should navigate results with keyboard', () => {
    const { result } = renderHook(() => useCommandPalette())
    
    act(() => {
      result.current.setResults([{ id: '1', title: 'R1', type: 'invoice' }, { id: '2', title: 'R2', type: 'invoice' }, { id: '3', title: 'R3', type: 'invoice' }] as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    })

    expect(result.current.selectedIndex).toBe(0)

    act(() => {
      result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    })
    expect(result.current.selectedIndex).toBe(1)

    act(() => {
      result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    })
    expect(result.current.selectedIndex).toBe(2)

    act(() => {
      result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    })
    expect(result.current.selectedIndex).toBe(0) // Wrap around

    act(() => {
      result.current.handleKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    })
    expect(result.current.selectedIndex).toBe(2) // Wrap around backwards
  })

  it('should handle Enter key to select result', () => {
    const { result } = renderHook(() => useCommandPalette())
    const mockResults = [{ id: '1', title: 'Result 1', type: 'invoice' }]
    
    act(() => {
      result.current.setResults(mockResults as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      result.current.setIsOpen(true)
    })

    const consoleSpy = vi.spyOn(console, 'log')
    
    act(() => {
      result.current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent)
    })

    expect(consoleSpy).toHaveBeenCalledWith('Selected:', mockResults[0])
    expect(result.current.isOpen).toBe(false)
    expect(result.current.query).toBe('')
  })

  it('should close on Escape key', () => {
    const { result } = renderHook(() => useCommandPalette())
    
    act(() => {
      result.current.setIsOpen(true)
    })

    const event = new KeyboardEvent('keydown', { key: 'Escape' })
    act(() => {
      window.dispatchEvent(event)
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('should toggle on Cmd+K', () => {
    const { result } = renderHook(() => useCommandPalette())
    
    expect(result.current.isOpen).toBe(false)

    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
    act(() => {
      window.dispatchEvent(event)
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('should handle search failure response', async () => {
    const mockError = { success: false, error: 'API Error' }
    vi.mocked(fetchApi).mockResolvedValue(mockError as any) // eslint-disable-line @typescript-eslint/no-explicit-any

    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      result.current.setQuery('test')
    })

    act(() => {
      vi.advanceTimersByTime(350)
    })

    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('API Error')
    expect(result.current.results).toEqual([])
  })

  it('should handle search connection error', async () => {
    vi.mocked(fetchApi).mockRejectedValue(new Error('Network fail'))

    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      result.current.setQuery('test')
    })

    act(() => {
      vi.advanceTimersByTime(350)
    })

    await vi.waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Connection failed')
  })

  it('should instantly match local pages by keyword', () => {
    const { result } = renderHook(() => useCommandPalette())

    act(() => {
      result.current.setQuery('สายพาน')
    })

    // Should immediately find 'intro' page matching keyword 'สายพาน'
    expect(result.current.results).toHaveLength(1)
    expect(result.current.results[0]).toEqual({
      id: 'intro',
      type: 'action',
      title: 'Intro & Architecture',
      description: 'ภาพรวมสถาปัตยกรรมระบบ',
    })
  })

  it('should route action items correctly on selection', () => {
    const setActiveTab = vi.fn()
    const onLaunchDemo = vi.fn()
    const { result } = renderHook(() => useCommandPalette(setActiveTab, onLaunchDemo))

    // Select standard action (e.g. security)
    act(() => {
      result.current.handleSelect({ id: 'security', type: 'action', title: 'Identity & Shield' })
    })
    expect(setActiveTab).toHaveBeenCalledWith('security')

    // Select presentation action
    act(() => {
      result.current.handleSelect({ id: 'presentation', type: 'action', title: 'Presentation Mode' })
    })
    expect(onLaunchDemo).toHaveBeenCalled()
  })
})

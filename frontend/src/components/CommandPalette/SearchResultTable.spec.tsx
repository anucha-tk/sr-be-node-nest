import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SearchResultTable } from './SearchResultTable'
import type { SearchResult } from '../../hooks/useCommandPalette'

describe('SearchResultTable', () => {
  const mockResults: SearchResult[] = [
    {
      id: 'inv_1',
      type: 'invoice',
      invoiceNumber: 'INV-001',
      title: 'Acme Invoice',
      description: 'Monthly consulting fee',
      amount: 1500,
    },
    {
      id: 'key_1',
      type: 'api-key',
      title: 'Production API Key',
      description: 'Used for main services',
      status: 'active',
    },
  ]

  it('should render table headers correctly', () => {
    render(
      <SearchResultTable
        results={mockResults}
        selectedIndex={0}
        onSelect={vi.fn()}
      />
    )

    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('ID / Key')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('should render results in high density list with type badges and values', () => {
    render(
      <SearchResultTable
        results={mockResults}
        selectedIndex={0}
        onSelect={vi.fn()}
      />
    )

    // Verify invoice fields
    expect(screen.getByText('invoice')).toBeInTheDocument()
    expect(screen.getByText('INV-001')).toBeInTheDocument()
    expect(screen.getByText('Acme Invoice')).toBeInTheDocument()
    expect(screen.getByText('Monthly consulting fee')).toBeInTheDocument()
    expect(screen.getByText('$1,500.00')).toBeInTheDocument()

    // Verify key fields
    expect(screen.getByText('api-key')).toBeInTheDocument()
    expect(screen.getByText('key_1')).toBeInTheDocument()
    expect(screen.getByText('Production API Key')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
  })

  it('should call onSelect when a row is clicked', () => {
    const handleSelect = vi.fn()
    render(
      <SearchResultTable
        results={mockResults}
        selectedIndex={0}
        onSelect={handleSelect}
      />
    )

    const invoiceRow = screen.getByText('Acme Invoice')
    fireEvent.click(invoiceRow)

    expect(handleSelect).toHaveBeenCalledWith(mockResults[0])
  })
})

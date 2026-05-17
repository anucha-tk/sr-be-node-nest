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

  it('should handle supplier, action, and default types with correct styling and fallback formatting', () => {
    const extraResults: SearchResult[] = [
      {
        id: 'sup_123',
        type: 'supplier',
        supplierName: 'Global Corp',
        description: 'Supplier for services',
      },
      {
        id: 'security',
        type: 'action',
        title: 'Identity & Shield',
      },
      {
        id: 'custom_id_too_long_value',
        type: 'other' as any,
        name: 'Custom Node',
      },
      {
        id: 'short',
        type: 'other' as any,
      }
    ]

    render(
      <SearchResultTable
        results={extraResults}
        selectedIndex={1}
        onSelect={vi.fn()}
      />
    )

    expect(screen.getByText('supplier')).toBeInTheDocument()
    expect(screen.getByText('Global Corp')).toBeInTheDocument()

    expect(screen.getByText('action')).toBeInTheDocument()
    expect(screen.getByText('NAV: security')).toBeInTheDocument()

    expect(screen.getByText('custom_i...')).toBeInTheDocument()
    expect(screen.getByText('Custom Node')).toBeInTheDocument()

    expect(screen.getByText('Untitled')).toBeInTheDocument()
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

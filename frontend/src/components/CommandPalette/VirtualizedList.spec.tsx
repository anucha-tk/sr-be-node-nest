import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VirtualizedList } from './VirtualizedList'

describe('VirtualizedList', () => {
  const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`)
  const itemHeight = 40
  const height = 200 // Visible count = 5

  it('should render only visible items and overscan buffer', () => {
    render(
      <VirtualizedList
        items={items}
        itemHeight={itemHeight}
        height={height}
        renderItem={(item, index) => (
          <div data-testid={`item-${index}`}>{item}</div>
        )}
      />
    )

    // Visible: 0 to 4. Overscan: 5 more items (up to index 9)
    // Indexes above 10 should not be rendered
    expect(screen.getByTestId('item-0')).toBeInTheDocument()
    expect(screen.getByTestId('item-4')).toBeInTheDocument()
    expect(screen.getByTestId('item-9')).toBeInTheDocument()
    expect(screen.queryByTestId('item-15')).not.toBeInTheDocument()
  })

  it('should update visible items on scroll', () => {
    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={itemHeight}
        height={height}
        renderItem={(item, index) => (
          <div data-testid={`item-${index}`}>{item}</div>
        )}
      />
    )

    const scrollContainer = container.firstChild as HTMLDivElement
    expect(scrollContainer).toBeInTheDocument()

    // Scroll down by 200px (5 items)
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 200 } })

    // Now start index is 5, with overscan buffer of 5 (so index 0 is still in buffer range 0-15)
    // Let's scroll deeper, e.g. 1000px (25 items)
    fireEvent.scroll(scrollContainer, { target: { scrollTop: 1000 } })

    // Index 0 should no longer be rendered since it's far outside buffer range
    expect(screen.queryByTestId('item-0')).not.toBeInTheDocument()
    expect(screen.getByTestId('item-25')).toBeInTheDocument()
  })

  it('should scroll active item into view when selectedIndex changes', () => {
    const { container, rerender } = render(
      <VirtualizedList
        items={items}
        itemHeight={itemHeight}
        height={height}
        selectedIndex={0}
        renderItem={(item, index, isSelected) => (
          <div data-testid={`item-${index}`} className={isSelected ? 'selected' : ''}>
            {item}
          </div>
        )}
      />
    )

    const scrollContainer = container.firstChild as HTMLDivElement
    
    // Set selectedIndex to 15 (which is below the viewport)
    rerender(
      <VirtualizedList
        items={items}
        itemHeight={itemHeight}
        height={height}
        selectedIndex={15}
        renderItem={(item, index, isSelected) => (
          <div data-testid={`item-${index}`} className={isSelected ? 'selected' : ''}>
            {item}
          </div>
        )}
      />
    )

    // ScrollTop should be adjusted to fit the item in viewport (15 * 40 - 200 = 400 + 40 = 440)
    expect(scrollContainer.scrollTop).toBeGreaterThan(0)
  })
})

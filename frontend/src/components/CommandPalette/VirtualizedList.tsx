import { useRef, useEffect, useState, type UIEvent, type ReactNode } from 'react'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  height: number
  selectedIndex?: number
  renderItem: (item: T, index: number, isSelected: boolean) => ReactNode
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  selectedIndex = -1,
  renderItem,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * itemHeight
  const visibleCount = Math.ceil(height / itemHeight)
  
  // Buffers (overscan) to ensure smooth scrolling
  const overscan = 5
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + height) / itemHeight) + overscan)

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  // Scroll active item into view during keyboard navigation
  useEffect(() => {
    if (selectedIndex === -1 || !containerRef.current) return

    const container = containerRef.current
    const itemTop = selectedIndex * itemHeight
    const itemBottom = itemTop + itemHeight

    const currentScrollTop = container.scrollTop
    const viewportBottom = currentScrollTop + height

    if (itemTop < currentScrollTop) {
      // Scroll up to fit
      container.scrollTop = itemTop
    } else if (itemBottom > viewportBottom) {
      // Scroll down to fit
      container.scrollTop = itemBottom - height
    }
  }, [selectedIndex, itemHeight, height])

  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    const item = items[i]
    if (item) {
      visibleItems.push({
        item,
        index: i,
        top: i * itemHeight,
      })
    }
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="overflow-y-auto overflow-x-hidden relative custom-scrollbar select-none"
      style={{ height }}
    >
      <div className="w-full relative" style={{ height: totalHeight }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            className="absolute left-0 w-full"
            style={{
              top,
              height: itemHeight,
            }}
          >
            {renderItem(item, index, index === selectedIndex)}
          </div>
        ))}
      </div>
    </div>
  )
}

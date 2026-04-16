import { ReactNode, useEffect, useRef, useState } from 'react'

interface FitScalePanelProps {
  baseWidth: number
  baseHeight?: number
  children: ReactNode
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function FitScalePanel({ baseWidth, baseHeight, children }: FitScalePanelProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 })
  const [measuredHeight, setMeasuredHeight] = useState(baseHeight ?? 1)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      setContainerSize({
        width: Math.max(1, Math.round(entry.contentRect.width)),
        height: Math.max(1, Math.round(entry.contentRect.height)),
      })
    })

    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (baseHeight) {
      setMeasuredHeight(baseHeight)
      return
    }

    const element = contentRef.current
    if (!element) return

    const measureHeight = () => {
      setMeasuredHeight(Math.max(1, Math.ceil(element.scrollHeight)))
    }

    measureHeight()

    const resizeObserver = new ResizeObserver(() => measureHeight())
    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [baseHeight, children])

  const naturalHeight = Math.max(1, baseHeight ?? measuredHeight)
  const scale = clamp(
    Math.min(containerSize.width / baseWidth, containerSize.height / naturalHeight, 1),
    0.1,
    1,
  )

  return (
    <div className="fit-scale-panel" ref={containerRef}>
      <div
        className="fit-scale-stage"
        style={{
          width: `${baseWidth * scale}px`,
          height: `${naturalHeight * scale}px`,
        }}
      >
        <div
          className="fit-scale-transform"
          style={{
            width: `${baseWidth}px`,
            height: `${naturalHeight}px`,
            transform: `scale(${scale})`,
          }}
        >
          <div className="fit-scale-content" ref={contentRef} style={{ width: `${baseWidth}px` }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
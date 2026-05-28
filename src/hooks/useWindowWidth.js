import { useState, useEffect } from 'react'

export function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return width
}

export function useDevice() {
  const width = useWindowWidth()
  const isMobile = width <= 640
  const isTablet = width > 640 && width <= 1024
  const isDesktop = width > 1024
  
  return { isMobile, isTablet, isDesktop, width }
}
// Responsive breakpoints
export const breakpoints = {
  mobile: 640,
  tablet: 1024,
  desktop: 1200
}

// Responsive style helper
export const responsive = {
  // Padding
  padding: (isMobile, isTablet) => {
    if (isMobile) return '16px'
    if (isTablet) return '24px'
    return '32px'
  },
  
  // Font size
  fontSize: (isMobile, isTablet, size = 'md') => {
    const sizes = {
      xs: { mobile: '0.7rem', tablet: '0.75rem', desktop: '0.8rem' },
      sm: { mobile: '0.8rem', tablet: '0.85rem', desktop: '0.9rem' },
      md: { mobile: '0.9rem', tablet: '1rem', desktop: '1.1rem' },
      lg: { mobile: '1.2rem', tablet: '1.5rem', desktop: '1.8rem' },
      xl: { mobile: '1.5rem', tablet: '2rem', desktop: '2.5rem' },
      '2xl': { mobile: '1.8rem', tablet: '2.5rem', desktop: '3rem' }
    }
    const s = sizes[size] || sizes.md
    if (isMobile) return s.mobile
    if (isTablet) return s.tablet
    return s.desktop
  },
  
  // Grid columns
  gridCols: (isMobile, isTablet, cols = 3) => {
    if (isMobile) return '1fr'
    if (isTablet && cols === 3) return 'repeat(2, 1fr)'
    return `repeat(${cols}, 1fr)`
  },
  
  // Container width
  containerWidth: (isMobile, isTablet) => {
    if (isMobile) return '100%'
    if (isTablet) return '90%'
    return '480px'
  },
  
  // Form padding
  formPadding: (isMobile, isTablet) => {
    if (isMobile) return '20px'
    if (isTablet) return '25px'
    return '30px'
  },
  
  // Card padding
  cardPadding: (isMobile, isTablet) => {
    if (isMobile) return '15px'
    if (isTablet) return '18px'
    return '20px'
  }
}
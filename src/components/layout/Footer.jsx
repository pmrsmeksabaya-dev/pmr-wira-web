import React from 'react'
import { Heart } from 'lucide-react'

const Footer = () => {
  return (
    React.createElement('footer', { className: 'bg-black border-t border-red-900/30 py-8 mt-20' },
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 text-center' },
        React.createElement('div', { className: 'flex items-center justify-center space-x-2 mb-4' },
          React.createElement(Heart, { className: 'w-6 h-6 text-red-600', fill: '#dc2626' }),
          React.createElement('span', { className: 'text-lg font-bold text-white glow-red' }, 'PMR WIRA')
        ),
        React.createElement('p', { className: 'text-gray-400 text-sm' },
          '\u00a9 2026 Palang Merah Remaja Indonesia. All Rights Reserved.'
        ),
        React.createElement('p', { className: 'text-gray-500 text-xs mt-2' },
          'SMKN 1 Pringgabaya - Generasi Muda Peduli Kemanusiaan'
        )
      )
    )
  )
}

export default Footer

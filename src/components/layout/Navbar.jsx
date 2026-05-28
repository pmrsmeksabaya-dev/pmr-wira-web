import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const getLinkClass = (path) => {
    if (location.pathname === path) {
      return 'text-sm font-medium transition text-red-500'
    }
    return 'text-sm font-medium transition text-gray-300 hover:text-red-400'
  }

  return (
    React.createElement('nav', { className: 'bg-black/90 backdrop-blur-md border-b border-red-900/30 fixed w-full z-50 top-0' },
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement('div', { className: 'flex justify-between items-center h-16' },
          React.createElement(Link, { to: '/', className: 'flex items-center space-x-2' },
            React.createElement(Heart, { className: 'w-8 h-8 text-red-600', fill: '#dc2626' }),
            React.createElement('div', null,
              React.createElement('h1', { className: 'text-sm font-bold text-white glow-red' }, 'PMR WIRA'),
              React.createElement('p', { className: 'text-xs text-gray-400' }, 'SMKN 1 Pringgabaya')
            )
          ),
          React.createElement('div', { className: 'hidden md:flex items-center space-x-8' },
            React.createElement(Link, { to: '/', className: getLinkClass('/') }, 'Beranda'),
            React.createElement(Link, { to: '/pendaftaran', className: getLinkClass('/pendaftaran') }, 'Pendaftaran'),
            React.createElement(Link, { to: '/admin/login' },
              React.createElement('button', { className: 'btn-outline text-sm py-2 px-4' }, 'Login Admin')
            )
          ),
          React.createElement('button', {
            className: 'md:hidden text-gray-300 hover:text-red-400',
            onClick: () => setIsOpen(!isOpen)
          }, isOpen ? React.createElement(X, { className: 'w-6 h-6' }) : React.createElement(Menu, { className: 'w-6 h-6' }))
        ),
        isOpen && React.createElement('div', { className: 'md:hidden pb-4 border-t border-red-900/30' },
          React.createElement(Link, {
            to: '/',
            className: 'block py-3 text-gray-300 hover:text-red-400 transition',
            onClick: () => setIsOpen(false)
          }, 'Beranda'),
          React.createElement(Link, {
            to: '/pendaftaran',
            className: 'block py-3 text-gray-300 hover:text-red-400 transition',
            onClick: () => setIsOpen(false)
          }, 'Pendaftaran'),
          React.createElement(Link, {
            to: '/admin/login',
            className: 'block py-3',
            onClick: () => setIsOpen(false)
          },
            React.createElement('button', { className: 'btn-outline text-sm py-2 px-4 w-full' }, 'Login Admin')
          )
        )
      )
    )
  )
}

export default Navbar

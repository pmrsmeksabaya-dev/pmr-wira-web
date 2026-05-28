import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Pendaftaran from '../pages/Pendaftaran/Pendaftaran'
import AdminLogin from '../pages/AdminLogin/AdminLogin'
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard'

const AppRoutes = () => {
  return (
    React.createElement(Routes, null,
      React.createElement(Route, { path: '/', element: React.createElement(Home) }),
      React.createElement(Route, { path: '/pendaftaran', element: React.createElement(Pendaftaran) }),
      React.createElement(Route, { path: '/admin/login', element: React.createElement(AdminLogin) }),
      React.createElement(Route, { path: '/admin/dashboard', element: React.createElement(AdminDashboard) })
    )
  )
}

export default AppRoutes

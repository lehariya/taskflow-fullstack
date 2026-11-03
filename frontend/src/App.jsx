import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { CheckSquare, ShoppingBag } from 'lucide-react'
import TodoPage from './pages/TodoPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetail from './pages/ProductDetail'

export default function App() {
  return <div className="app-shell">
    <header className="topbar">
      <NavLink to="/todos" className="brand"><span className="brand-mark">T</span> TaskFlow</NavLink>
      <nav>
        <NavLink to="/todos"><CheckSquare size={17}/> Todo Tracker</NavLink>
        <NavLink to="/products"><ShoppingBag size={17}/> Products</NavLink>
      </nav>
    </header>
    <main className="page-wrap">
      <Routes>
        <Route path="/" element={<Navigate to="/todos" replace />} />
        <Route path="/todos" element={<TodoPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="*" element={<Navigate to="/todos" replace />} />
      </Routes>
    </main>
    <footer>TaskFlow · Built with React, Flask & SQLite</footer>
  </div>
}

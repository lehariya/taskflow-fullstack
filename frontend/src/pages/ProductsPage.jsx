import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, ArrowUpRight } from 'lucide-react'
import { getProducts } from '../api'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { getProducts().then(setProducts).catch(e => setError(e.message)).finally(() => setLoading(false)) }, [])
  const categories = ['all', ...new Set(products.map(p => p.category))]
  const filtered = products.filter(p => (category === 'all' || p.category === category) && p.title.toLowerCase().includes(search.toLowerCase()))
  return <section>
    <div className="section-heading"><div><span className="eyebrow">DISCOVER THE COLLECTION</span><h1>Product Explorer</h1><p>Browse products and open any item to see its details.</p></div><span className="product-total">{products.length} products</span></div>
    <div className="toolbar"><label className="search-box"><Search size={18}/><input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}/></label>
      <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter category">{categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>)}</select>
    </div>
    {loading && <div className="empty-state">Loading products from Fake Store API…</div>}
    {error && <div className="alert error">{error}</div>}
    {!loading && !error && filtered.length === 0 && <div className="empty-state">No products match your search.</div>}
    <div className="product-grid">{filtered.map(p => <Link className="product-card" to={`/products/${p.id}`} key={p.id}>
      <div className="product-image"><img src={p.image} alt={p.title} loading="lazy"/></div>
      <div className="product-info"><span className="category-label">{p.category}</span><h3>{p.title}</h3><div className="product-meta"><b>${Number(p.price).toFixed(2)}</b><span><Star size={14} fill="currentColor"/> {p.rating?.rate ?? '—'}</span></div><span className="details-link">View details <ArrowUpRight size={15}/></span></div>
    </Link>)}</div>
  </section>
}

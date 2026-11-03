import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Star, ShoppingBag } from 'lucide-react'
import { getProduct } from '../api'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { setLoading(true); getProduct(id).then(setProduct).catch(e => setError(e.message)).finally(() => setLoading(false)) }, [id])
  if (loading) return <div className="empty-state">Loading product details…</div>
  if (error) return <><div className="alert error">{error}</div><Link className="back-link" to="/products"><ArrowLeft size={16}/> Back to products</Link></>
  if (!product) return null
  return <section className="detail-page">
    <Link className="back-link" to="/products"><ArrowLeft size={16}/> Back to products</Link>
    <div className="detail-card"><div className="detail-image"><img src={product.image} alt={product.title}/></div>
      <div className="detail-copy"><span className="category-label">{product.category}</span><h1>{product.title}</h1>
        <div className="detail-rating"><Star size={17} fill="currentColor"/> {product.rating?.rate ?? 'No rating'} <span>({product.rating?.count ?? 0} reviews)</span></div>
        <div className="detail-price">${Number(product.price).toFixed(2)}</div>
        <h3>Description</h3><p>{product.description}</p>
        <div className="detail-note"><ShoppingBag size={17}/> Product information supplied by Fake Store API.</div>
      </div>
    </div>
  </section>
}

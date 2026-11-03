const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
  return data
}
export const getTodos = () => request('/todos')
export const addTodo = title => request('/todos', { method: 'POST', body: JSON.stringify({ title }) })
export const editTodo = (id, title) => request(`/todos/${id}`, { method: 'PUT', body: JSON.stringify({ title }) })
export const removeTodo = id => request(`/todos/${id}`, { method: 'DELETE' })
export const getProducts = () => request('/products')
export const getProduct = id => request(`/products/${id}`)

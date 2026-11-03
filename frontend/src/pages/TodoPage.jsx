import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, ListTodo, RefreshCw } from 'lucide-react'
import { addTodo, editTodo, getTodos, removeTodo } from '../api'

export default function TodoPage() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadTodos() {
    setLoading(true); setError('')
    try { setTodos(await getTodos()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { loadTodos() }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!input.trim()) return
    setSaving(true); setError(''); setNotice('')
    try {
      const result = await addTodo(input.trim())
      setTodos(old => [...result.created.reverse(), ...old])
      setInput('')
      setNotice(`${result.count} task${result.count === 1 ? '' : 's'} added successfully.`)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }
  function beginEdit(todo) { setEditingId(todo.id); setEditValue(todo.title); setError(''); setNotice('') }
  async function saveEdit(id) {
    if (!editValue.trim()) { setError('Task name cannot be empty.'); return }
    setSaving(true); setError('')
    try {
      const updated = await editTodo(id, editValue.trim())
      setTodos(old => old.map(t => t.id === id ? updated : t))
      setEditingId(null); setNotice('Task updated. Counter increased by 1.')
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }
  async function handleDelete(id) {
    setError(''); setNotice('')
    try { await removeTodo(id); setTodos(old => old.filter(t => t.id !== id)); setNotice('Task deleted.') }
    catch (e) { setError(e.message) }
  }

  return <section>
    <div className="hero-heading">
      <div><span className="eyebrow">YOUR DAILY WORKSPACE</span><h1>What's the plan for today?</h1>
      <p>Small steps, steady progress. Every edit gets counted.</p></div>
      <div className="hero-icon"><ListTodo size={30}/></div>
    </div>
    <div className="todo-panel">
      <form className="add-form" onSubmit={handleAdd}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Add a task · e.g. Make Food 3" maxLength="200" aria-label="Task name"/>
        <button className="primary-btn" disabled={saving || !input.trim()}><Plus size={18}/> Add task</button>
      </form>
      <p className="hint">Tip: add a number at the end to create that many copies (example: <b>Study Python 3</b>).</p>
      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert success">{notice}</div>}
      <div className="list-heading"><h2>Your tasks <span className="count-pill">{todos.length}</span></h2><button className="icon-btn subtle" onClick={loadTodos} title="Refresh tasks"><RefreshCw size={16}/></button></div>
      {loading ? <div className="empty-state">Loading your tasks…</div> :
        todos.length === 0 ? <div className="empty-state"><ListTodo size={34}/><b>No tasks yet</b><span>Add your first task above to get started.</span></div> :
        <div className="todo-list">{todos.map((todo, index) => <article className={`todo-item color-${index % 4}`} key={todo.id}>
          {editingId === todo.id ? <>
            <input className="edit-input" value={editValue} onChange={e => setEditValue(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') saveEdit(todo.id); if(e.key === 'Escape') setEditingId(null) }} autoFocus maxLength="200"/>
            <div className="actions"><button className="icon-btn" onClick={() => saveEdit(todo.id)} disabled={saving} title="Save"><Check/></button><button className="icon-btn" onClick={() => setEditingId(null)} title="Cancel"><X/></button></div>
          </> : <>
            <div className="task-copy"><span className="task-title">{todo.title}</span><span className="task-count">Updated {todo.update_count} {todo.update_count === 1 ? 'time' : 'times'}</span></div>
            <div className="actions"><button className="icon-btn" onClick={() => handleDelete(todo.id)} title="Delete task"><Trash2 size={18}/></button><button className="icon-btn" onClick={() => beginEdit(todo)} title="Edit task"><Pencil size={18}/></button></div>
          </>}
        </article>)}</div>}
    </div>
  </section>
}

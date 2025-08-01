import { useState } from 'react'
import './App.css'
import RecipeCard from './components/RecipeCard'

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  cook_time?: string;
  image?: string;
  success: boolean;
}

function App() {
  const [url, setUrl] = useState('')
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setRecipe(null)

    try {
      const response = await fetch('http://localhost:5000/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() })
      })

      const data = await response.json()
      
      if (data.success) {
        setRecipe(data)
      } else {
        setError(data.error || 'Failed to parse recipe')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1>Recipe Hub</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Recipe URL"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !url.trim()}>
          {loading ? 'Parsing...' : 'Parse Recipe'}
        </button>
      </form>

      {error && <div style={{color: 'red'}}>{error}</div>}
      
      {recipe && <RecipeCard recipe={recipe} />}
    </>
  )
}

export default App

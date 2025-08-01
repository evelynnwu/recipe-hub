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
    <div style={{
      backgroundColor: '#FFFFFF',
      color: '#000000',
      padding: '20px',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{
        textAlign: 'center',
        marginBottom: '30px',
        color: '#333333'
      }}>
        Recipe Hub
      </h1>

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <input
          type="text"
          value={url}
          style={{
            backgroundColor: '#FFFFFF',
            color: '#000000',
            border: '2px solid #ccc',
            borderRadius: '5px',
            padding: '10px',
            width: '400px',
            fontSize: '16px'
          }}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter recipe URL here..."
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !url.trim()}
          style={{
            backgroundColor: loading || !url.trim() ? '#cccccc' : '#007bff',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? 'Parsing...' : 'Parse Recipe'}
        </button>
      </form>

      {error && (
        <div style={{
          color: '#dc3545',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          padding: '10px',
          margin: '20px auto',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {recipe && <RecipeCard recipe={recipe} />}
    </div>
  )
}

export default App
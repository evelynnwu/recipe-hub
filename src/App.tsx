import { useState } from 'react'
import './App.css'
import RecipeCard from './components/RecipeCard'
import { Container, Box, TextField, Button, Alert, Grid, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
  prep_time: string;
  cook_time?: string;
  image?: string;
  success: boolean;
  id?: string;
}

function App() {
  const [url, setUrl] = useState('')
  const [parsedRecipe, setParsedRecipe] = useState<Recipe | null>(null)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const theme = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setParsedRecipe(null)

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
        setParsedRecipe({ ...data, id: Date.now().toString() })
        setUrl('')
      } else {
        setError(data.error || 'Failed to parse recipe')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRecipe = () => {
    if (parsedRecipe) {
      setSavedRecipes(prev => [...prev, parsedRecipe])
      setParsedRecipe(null)
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ mb: 4 }}>
        Recipe Hub
      </Typography>

      {/* Compact Parse Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, maxWidth: 600, mx: 'auto' }}>
          <TextField
            fullWidth
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter recipe URL here..."
            disabled={loading}
            variant="outlined"
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !url.trim()}
            sx={{ 
              minWidth: 120,
              backgroundColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              }
            }}
          >
            {loading ? 'Parsing...' : 'Parse'}
          </Button>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          {error}
        </Alert>
      )}

      {/* Parsed Recipe Preview with Save Button */}
      {parsedRecipe && (
        <Box sx={{ mb: 4, width: 345, height: 300, mx: 'auto' }}>
          <RecipeCard recipe={parsedRecipe} />
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleSaveRecipe}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                }
              }}
            >
              Save to Collection
            </Button>
          </Box>
        </Box>
      )}

      {/* Recipe Grid */}
      {savedRecipes.length > 0 && (
        <Grid container spacing={3}>
          {savedRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
              <RecipeCard recipe={recipe} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

export default App
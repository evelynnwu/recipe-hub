import React from 'react'
import './App.css'
import { Container, Box, ThemeProvider, CircularProgress, Button } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import recipeHubLogo from './assets/recipeHubLogo.png'
import { theme } from './theme/theme'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/auth/LoginForm'
import { UserProfile } from './components/auth/UserProfile'
import { Home } from './pages/Home'
import { Friends } from './pages/Friends'
import { FriendRecipes } from './pages/FriendRecipes'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme()
  
  return (
    <>
      <Box 
        sx={{ 
          width: '100vw',
          backgroundColor: theme.palette.primary.light,
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          height: '100px'
        }}
      >
        <Box sx={{ maxWidth: 'xl', mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: '100%' }}>
          <img 
            src={recipeHubLogo} 
            alt="Recipe Hub" 
            style={{ height: '150%', width: 'auto'}}
          />
          <Box sx={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              component={Link}
              to="/"
              sx={{ color: 'black', textDecoration: 'none' }}
            >
              My Recipes
            </Button>
            <Button 
              component={Link}
              to="/friends"
              sx={{ color: 'black', textDecoration: 'none' }}
            >
              Friends
            </Button>
            <UserProfile />
          </Box>
        </Box>
      </Box>

      <Container maxWidth="xl">
        {children}
      </Container>
    </>
  )
}

const RecipeApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/friends/:friendId" element={<FriendRecipes />} />
        </Routes>
      </Layout>
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <RecipeApp />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
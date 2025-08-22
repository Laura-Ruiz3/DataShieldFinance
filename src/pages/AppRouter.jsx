import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Box, Container, Typography } from '@mui/material'
import Home from './Home'
import Portfolios from './Portfolios'
import Footer from '../components/Footer';
import Navbar from '../components/Navbar'

export default function AppRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname === '/portfolios' ? 'portfolio' : 'home'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5fff7', // Light green-white base
        backgroundImage: 'linear-gradient(to bottom, #ffffff, #f0fff5, #e8f8f0)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Navbar
        active={active}
        onNavigate={(p) => navigate(p === 'portfolio' ? '/portfolios' : '/')}
      />
      <Container 
        component="main" 
        maxWidth="lg"
        sx={{ 
          py: 3, 
          px: 2, 
          flexGrow: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: 2,
          my: 2
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolios" element={<Portfolios />} />
        </Routes>
      </Container>
      <Container 
        component="footer" 
        maxWidth="lg"
        sx={{ 
          py: 3, 
          px: 2,
          borderTop: '1px solid #e0efe0' 
        }}
      >
        {/* <Typography 
          variant="caption" 
          color="#0B5D32"
        >
          © DataShield Finance version 0
        </Typography> */}        
      </Container>
      <Footer />
    </Box>
  )
}
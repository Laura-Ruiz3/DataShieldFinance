import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './pages/AppRouter'
import './styles/index.css'

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#0B5D32',
      light: '#3e8e5e',
      dark: '#00310d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f5f5f5',
      contrastText: '#0B5D32',
    },
    background: {
      default: '#f5fff7',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  shape: {
    borderRadius: 4,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
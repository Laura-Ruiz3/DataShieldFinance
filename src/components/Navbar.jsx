import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  Divider
} from '@mui/material';

export default function Navbar({ onNavigate, active }) {
  return (
    <AppBar 
      position="sticky" 
      elevation={2} 
      sx={{ 
        backgroundColor: '#0B5D32', // Keep dark green background
        borderBottom: '1px solid rgba(220, 220, 220, 0.15)' // Lighter gray border
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f5f5f5', // Light gray background for logo
              width: 36, 
              height: 36, 
              borderRadius: '8px'
            }}>
              <img 
                src="/favicon.png" 
                alt="DataShield Finance Logo" 
                style={{ width: 22, height: 22 }}
              />
            </Box>
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                fontWeight: 600, 
                color: "#f5f5f5", // Light gray text instead of pure white
                fontFamily: '"Montserrat", "Roboto", sans-serif',
                letterSpacing: '0.5px'
              }}
            >
              DataShield Finance
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ 
            mr: 3, 
            backgroundColor: 'rgba(220, 220, 220, 0.3)' // Gray divider
          }} />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => onNavigate('home')}
              sx={{ 
                borderRadius: 1,
                px: 2.5,
                py: 1,
                color: '#f5f5f5', // Light gray text
                position: 'relative',
                '&:after': active === 'home' ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 6,
                  left: 12,
                  right: 12,
                  height: 3,
                  backgroundColor: '#e0e0e0', // Gray indicator for active tab
                  borderRadius: 3
                } : {},
                '&:hover': {
                  backgroundColor: 'rgba(220, 220, 220, 0.15)' // Gray hover state
                }
              }}
            >
              Dashboard
            </Button>
            <Button
              onClick={() => onNavigate('portfolio')}
              sx={{ 
                borderRadius: 1,
                px: 2.5,
                py: 1,
                color: '#f5f5f5', // Light gray text
                position: 'relative',
                '&:after': active === 'portfolio' ? {
                  content: '""',
                  position: 'absolute',
                  bottom: 6,
                  left: 12,
                  right: 12,
                  height: 3,
                  backgroundColor: '#e0e0e0', // Gray indicator for active tab
                  borderRadius: 3
                } : {},
                '&:hover': {
                  backgroundColor: 'rgba(220, 220, 220, 0.15)' // Gray hover state
                }
              }}
            >
              Portfolios
            </Button>
          </Box>
          
          {/* <Box sx={{ marginLeft: 'auto' }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#f5f5f5', // Light gray button
                color: '#0B5D32', // Green text
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#e0e0e0', // Darker gray on hover
                  boxShadow: 'none'
                }
              }}
            >
              Market Data
            </Button>
          </Box> */}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
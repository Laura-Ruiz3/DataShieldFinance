import Card from '../components/Card'
import NewsWidget from '../components/NewsWidget'
import StocksSidebar from '../components/StocksSidebar'
import Assets_req from '../components/Assets_req'
import * as React from 'react'
import {
  Box, 
  Container, 
  Button, 
  Typography, 
  Modal,
  Grid,
  Stack
} from '@mui/material'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default function Home() {
  const [open, setOpen] = React.useState("")
  const handleOpen = (modelName) => setOpen(modelName)
  const handleClose = () => setOpen("")
  return (
    <Container sx={{ backgroundColor: 'transparent' }}>            
      <Card sx={{ mb: 3 }}>   
        <Typography 
          variant="h6" 
          component="div"
          align="center" 
          sx={{ 
            width: '100%',
            fontWeight: 800,
            color: '#0B5D32' // Changed to green
          }}
        >
          Welcome to DataShield Finance
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 1 }}
        >
          Go to <Box component="strong" sx={{ color: '#0B5D32' }}>Portfolios</Box> to review your positions. On the Home page, you'll find Mexican financial news and a dummy watchlist.
        </Typography>
              
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ 
            mt: 2,
            flexWrap: 'wrap',
            gap: 1
          }}
          justifyContent={"center"}
        >
          <Box sx={{ py: 1 }}>
            <Button 
              variant="contained"
              onClick={() => handleOpen("modal-Personal-Finances")}
              sx={{ 
                borderRadius: 28,
                bgcolor: '#0B5D32', // Changed to green
                '&:hover': { bgcolor: '#094025' }, // Darker green for hover
                color: '#ffffff'
              }}
            >
              Personal Finances
            </Button>
            <Modal 
              open={open === "modal-Personal-Finances"}
              onClose={handleClose}
              aria-labelledby="modal-Personal-Finances"
            >
              <Box sx={style}>
                <Typography id="modal-Personal-Finances" sx={{ mt: 2, fontSize: 20 }}>
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>50% Needs:</Box> Rent, Food, Transportation, Utilities, Healthcare, etc.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>30% Wants:</Box> Outlings, Trips, Personal shopping, Entretainment, etc.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>20% Savings & Investment:</Box> Emergency Found, Savings for Goals, Retirement Contributions or Investments.
                </Typography>
              </Box>
            </Modal>
          </Box>
          
          <Box sx={{ py: 1 }}>
            <Button 
              variant="contained"
              onClick={() => handleOpen("modal-Basic-Concepts")}
              sx={{ 
                borderRadius: 28,
                bgcolor: '#0B5D32', // Changed to green
                '&:hover': { bgcolor: '#094025' }, // Darker green for hover
                color: '#ffffff'
              }}
            >
              Basic Concepts
            </Button>
            <Modal 
              open={open === "modal-Basic-Concepts"}
              onClose={handleClose}
              aria-labelledby="modal-Basic-Concepts"
            >
              <Box sx={style}>
                <Typography id="modal-Basic-Concepts" sx={{ mt: 2, fontSize: 20 }}>
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Investing vs saving:</Box> Saving keeps money safe, investing aims to grow it by taking risks.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Risk and return:</Box> Higher potential returns usually mean higher risk of loss.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Investment horizon:</Box> The length of time you plan to keep your money invested (short, medium, or long term).
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Liquidity:</Box> How quickly and easily you can access your money.
                </Typography>
              </Box>
            </Modal>
          </Box>
          
          <Box sx={{ py: 1 }}>
            <Button 
              variant="contained"
              onClick={() => handleOpen("modal-Type-Investments")}
              sx={{ 
                borderRadius: 28,
                bgcolor: '#0B5D32', // Changed to green
                '&:hover': { bgcolor: '#094025' }, // Darker green for hover
                color: '#ffffff'
              }}
            >
              Type of Investments
            </Button>
            <Modal 
              open={open === "modal-Type-Investments"}
              onClose={handleClose}
              aria-labelledby="modal-Type-Investments"
            >
              <Box sx={style}>
                <Typography id="modal-Type-Investments" sx={{ mt: 2, fontSize: 20 }}>
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Fixed income (bonds, treasury bills, CETES):</Box> Safer, but lower returns.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Equities (stocks, ETFs, mutual funds):</Box> Potentially higher gains, but fluctuate in the short term.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Real estate (property or REITs):</Box> Long-term option, can provide rental income + value appreciation.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Retirement plans (401k, AFORE, pension funds):</Box> Essential to build long-term wealth
                </Typography>
              </Box>
            </Modal>
          </Box>
          
          <Box sx={{ py: 1 }}>
            <Button 
              variant="contained"
              onClick={() => handleOpen("modal-Habbits-Tips")}
              sx={{ 
                borderRadius: 28,
                bgcolor: '#0B5D32', // Changed to green
                '&:hover': { bgcolor: '#094025' }, // Darker green for hover
                color: '#ffffff'
              }}
            >
              Habits and Tips
            </Button>
            <Modal 
              open={open === "modal-Habbits-Tips"}
              onClose={handleClose}
              aria-labelledby="modal-Habbits-Tips"
            >
              <Box sx={style}>
                <Typography id="modal-Habbits-Tips" sx={{ mt: 2, fontSize: 20 }}>
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Diversification:</Box> Don't put all your money into one type of investment.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Compound interest:</Box> Reinvested earnings make your money grow exponentially over time.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Continuous learning:</Box> Read books, listen to podcasts, and follow economic news.
                  <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Discipline:</Box> Invest consistently (e.g., monthly) even if it's a small amount.
                </Typography>
              </Box>
            </Modal>
          </Box>
        </Stack>
      </Card>
      
      {/* Fixed grid structure */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 2, height: '100%', boxShadow: 1 }}>
            <Assets_req />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 2, height: '100%', boxShadow: 1 }}>
            <NewsWidget />
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 2, height: '100%', boxShadow: 1 }}>
            <StocksSidebar />
          </Box>
        </Grid>
      </Grid>

    </Container>
  )
}
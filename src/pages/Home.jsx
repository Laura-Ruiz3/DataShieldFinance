import Card from '../components/Card'
import NewsWidget from '../components/NewsWidget'
import StocksSidebar from '../components/StocksSidebar'
import * as React from 'react'
import {
  Box, 
  Container, 
  Button, 
  Typography, 
  Modal,
  Grid,
  Stack,
  Divider,
  Fade,
  Backdrop, Link
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
  bgcolor: '#f5f5f5', // Light gray background
  boxShadow: 24,
  p: 4,
  borderRadius: 3, // More rounded corners
  outline: 'none', // Removes default focus outline that can cause issues
};

export default function Home() {
  const [open, setOpen] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  // Fix for hydration errors by ensuring modals only render client-side
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const handleOpen = (modelName) => setOpen(modelName)
  const handleClose = () => setOpen("")
  
  // Create refs for modal content to manage focus properly
  const personalFinancesRef = React.useRef(null)
  const basicConceptsRef = React.useRef(null)
  const typeInvestmentsRef = React.useRef(null)
  const habbitsTipsRef = React.useRef(null)
  
  // Function to get modal title from the model name
  const getModalTitle = (modalName) => {
    switch(modalName) {
      case "modal-Personal-Finances":
        return "Personal Finances";
      case "modal-Basic-Concepts":
        return "Basic Concepts";
      case "modal-Type-Investments":
        return "Type of Investments";
      case "modal-Habbits-Tips":
        return "Habits and Tips";
      default:
        return "";
    }
  }
  
  return (
    <Container 
      sx={{ 
        backgroundColor: '#f5fff7',
        backgroundImage: 'linear-gradient(to bottom, #ffffff, #f0fff5, #e8f8f0)',
        pt: 2,
        pb: 4,
        borderRadius: 2,
        width: 'auto',
        height: 'auto',
        minWidth: '100%',
        maxWidth: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch'
      }}
    >        
      <Card sx={{ mb: 3 }}>   
        <Typography 
          variant="h6" 
          component="div"
          align="center" 
          sx={{ 
            width: '100%',
            fontWeight: 800,
            color: '#0B5D32'
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
          Go to <Link 
    href="/portfolios" 
    component="a" 
    sx={{ 
      color: '#0B5D32', 
      fontWeight: 'bold',
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline'
      }
    }}
  >
    Portfolios
  </Link> to review your investments.
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 1 }}
        >
          On the Home page, you'll find financial news and tips to help guide your investment decisions.
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
                bgcolor: '#0B5D32',
                '&:hover': { bgcolor: '#094025' },
                color: '#ffffff'
              }}
            >
              Personal Finances
            </Button>
            
            {/* Only render modals on client-side */}
            {mounted && (
              <Modal 
                open={open === "modal-Personal-Finances"}
                onClose={handleClose}
                aria-labelledby="modal-personal-finances-title"
                closeAfterTransition
                disableAutoFocus={true}
                disableEnforceFocus={false}
                disableRestoreFocus={false}
                BackdropComponent={Backdrop}
                BackdropProps={{
                  timeout: 500,
                }}
              >
                <Fade in={open === "modal-Personal-Finances"}>
                  <Box 
                    sx={style} 
                    tabIndex={-1}
                    ref={personalFinancesRef}
                  >
                    <Typography 
                      id="modal-personal-finances-title" 
                      variant="h5" 
                      align="center" 
                      sx={{ mb: 2, color: '#0B5D32', fontWeight: 'bold' }}
                    >
                      Personal Finances
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box component="div" sx={{ fontSize: 16, textAlign: 'justify' }}>
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>50% Needs:</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Rent, Food, Transportation, Utilities, Healthcare, etc.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>30% Wants:</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Outlings, Trips, Personal shopping, Entretainment, etc.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>20% Savings & Investment:</Box> 
                      <Box sx={{ pb: 2, pl: 2 }}>Emergency Found, Savings for Goals, Retirement Contributions or Investments.</Box>
                    </Box>
                  </Box>
                </Fade>
              </Modal>
            )}
          </Box>
          
          <Box sx={{ py: 1 }}>
            <Button 
              variant="contained"
              onClick={() => handleOpen("modal-Basic-Concepts")}
              sx={{ 
                borderRadius: 28,
                bgcolor: '#0B5D32',
                '&:hover': { bgcolor: '#094025' },
                color: '#ffffff'
              }}
            >
              Basic Concepts
            </Button>
            
            {mounted && (
              <Modal 
                open={open === "modal-Basic-Concepts"}
                onClose={handleClose}
                aria-labelledby="modal-basic-concepts-title"
                closeAfterTransition
                disableAutoFocus={true}
                disableEnforceFocus={false}
                disableRestoreFocus={false}
                BackdropComponent={Backdrop}
                BackdropProps={{
                  timeout: 500,
                }}
              >
                <Fade in={open === "modal-Basic-Concepts"}>
                  <Box 
                    sx={style}
                    tabIndex={-1}
                    ref={basicConceptsRef}
                  >
                    <Typography 
                      id="modal-basic-concepts-title" 
                      variant="h5" 
                      align="center" 
                      sx={{ mb: 2, color: '#0B5D32', fontWeight: 'bold' }}
                    >
                      Basic Concepts
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box component="div" sx={{ fontSize: 16, textAlign: 'justify' }}>
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Investing vs saving:</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Saving keeps money safe, investing aims to grow it by taking risks.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Risk and return:</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Higher potential returns usually mean higher risk of loss.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Investment horizon:</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>The length of time you plan to keep your money invested (short, medium, or long term).</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Liquidity:</Box> 
                      <Box sx={{ pb: 2, pl: 2 }}>How quickly and easily you can access your money.</Box>
                    </Box>
                  </Box>
                </Fade>
              </Modal>
            )}
          </Box>
          
          <Box sx={{ py: 1 }}>
            <Button 
              variant="contained"
              onClick={() => handleOpen("modal-Type-Investments")}
              sx={{ 
                borderRadius: 28,
                bgcolor: '#0B5D32',
                '&:hover': { bgcolor: '#094025' },
                color: '#ffffff'
              }}
            >
              Type of Investments
            </Button>
            
            {mounted && (
              <Modal 
                open={open === "modal-Type-Investments"}
                onClose={handleClose}
                aria-labelledby="modal-type-investments-title"
                closeAfterTransition
                disableAutoFocus={true}
                disableEnforceFocus={false}
                disableRestoreFocus={false}
                BackdropComponent={Backdrop}
                BackdropProps={{
                  timeout: 500,
                }}
              >
                <Fade in={open === "modal-Type-Investments"}>
                  <Box 
                    sx={style}
                    tabIndex={-1}
                    ref={typeInvestmentsRef}
                  >
                    <Typography 
                      id="modal-type-investments-title" 
                      variant="h5" 
                      align="center" 
                      sx={{ mb: 2, color: '#0B5D32', fontWeight: 'bold' }}
                    >
                      Type of Investments
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box component="div" sx={{ fontSize: 16, textAlign: 'justify' }}>
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Fixed income (bonds, treasury bills, CETES):</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Safer, but lower returns.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Equities (stocks, ETFs, mutual funds):</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Potentially higher gains, but fluctuate in the short term.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Real estate (property or REITs):</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Long-term option, can provide rental income + value appreciation.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Retirement plans (401k, AFORE, pension funds):</Box> 
                      <Box sx={{ pb: 2, pl: 2 }}>Essential to build long-term wealth.</Box>
                    </Box>
                  </Box>
                </Fade>
              </Modal>
            )}
          </Box>
          
          <Box sx={{ py: 1 }}>
            <Button 
              variant="contained"
              onClick={() => handleOpen("modal-Habbits-Tips")}
              sx={{ 
                borderRadius: 28,
                bgcolor: '#0B5D32',
                '&:hover': { bgcolor: '#094025' },
                color: '#ffffff'
              }}
            >
              Habits and Tips
            </Button>
            
            {mounted && (
              <Modal 
                open={open === "modal-Habbits-Tips"}
                onClose={handleClose}
                aria-labelledby="modal-habbits-tips-title"
                closeAfterTransition
                disableAutoFocus={true}
                disableEnforceFocus={false}
                disableRestoreFocus={false}
                BackdropComponent={Backdrop}
                BackdropProps={{
                  timeout: 500,
                }}
              >
                <Fade in={open === "modal-Habbits-Tips"}>
                  <Box 
                    sx={style}
                    tabIndex={-1}
                    ref={habbitsTipsRef}
                  >
                    <Typography 
                      id="modal-habbits-tips-title" 
                      variant="h5" 
                      align="center" 
                      sx={{ mb: 2, color: '#0B5D32', fontWeight: 'bold' }}
                    >
                      Habits and Tips
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Box component="div" sx={{ fontSize: 16, textAlign: 'justify' }}>
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Diversification:</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Don't put all your money into one type of investment.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Compound interest:</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Reinvested earnings make your money grow exponentially over time.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Continuous learning:</Box> 
                      <Box sx={{ pb: 3, pl: 2 }}>Read books, listen to podcasts, and follow economic news.</Box>
                      
                      <Box sx={{ pb: 2, color: '#0B5D32', fontWeight: 'bold' }}>Discipline:</Box> 
                      <Box sx={{ pb: 2, pl: 2 }}>Invest consistently (e.g., monthly) even if it's a small amount.</Box>
                    </Box>
                  </Box>
                </Fade>
              </Modal>
            )}
          </Box>
        </Stack>
      </Card>
      
      {/* Simplified grid structure with direct components */}
      {/* <Grid container spacing={3} mt={2}>
        <Grid item xs={12}>
          <StocksSidebar />
        </Grid>
        
        <Grid item xs={12}>
          <NewsWidget />
        </Grid>
      </Grid>       */}
      <StocksSidebar />
      <NewsWidget />
    </Container>
  )
}
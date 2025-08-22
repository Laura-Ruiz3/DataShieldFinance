import React from 'react';
import { Box, Grid, Typography, Stack, Divider, Link, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  
  return (
    <Box 
      component="footer"
      sx={{
        mt: 5,
        pt: 3,
        pb: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: 'rgba(11, 93, 50, 0.05)',
        borderRadius: '0 0 8px 8px',
        textAlign: 'center'
      }}
    >
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 1 }}>
            DataShield Finance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your safe start in the world of investing.
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 1 }}>
            Quick Links
          </Typography>
          <Stack spacing={1} direction="row" justifyContent="center" flexWrap="wrap">
            <Link href="/" sx={{ color: theme.palette.primary.main, mx: 1 }}>Home</Link>
            <Link href="/portfolios" sx={{ color: theme.palette.primary.main, mx: 1 }}>Portfolios</Link>
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 1 }}>
            Contact Us
          </Typography>
          <Typography variant="body2" color="text.secondary">
            support@datashieldfinance.com
          </Typography>
        </Grid>    
      </Grid>
      <Divider sx={{ mb: 2, mt: 2 }} />
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} DataShield Finance. All rights reserved.
          </Typography>
    </Box>
  );
};

export default Footer;
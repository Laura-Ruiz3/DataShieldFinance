import { Card as MuiCard, CardContent, Box, Typography } from '@mui/material';

export default function Card({ title, children, right }) {
  return (
    <MuiCard 
      sx={{ 
        borderRadius: 4,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        p: 2
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 1.5
        }}
      >
        {typeof title === 'string' ? (
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ fontWeight: 600, color: '#333' }}
          >
            {title}
          </Typography>
        ) : (
          title
        )}
        {right}
      </Box>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {children}
      </CardContent>
    </MuiCard>
  );
}
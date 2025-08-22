import { Box, Typography, CircularProgress } from '@mui/material';
import Card from './Card';
import { useMarketauxNews } from '../hooks/useMarketauxNews';

export default function NewsWidget({ sx }) {
  // Using a higher limit to display more news
  const { loading, error, news } = useMarketauxNews({ countries: 'us,mx,ca', language: 'en', limit: 6 });
  
  // Check if the error is specifically HTTP_402
  const isPaymentRequiredError = error && error.includes('HTTP_402');
  
  return (
    <Card 
      title={
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#0B5D32',
            fontFamily: '"Montserrat", "Roboto", sans-serif',
            fontSize: '1.1rem',
            paddingBottom: '8px',
            borderBottom: '2px solid #0B5D32',
            display: 'inline-block',
            mt: 2
          }}
        >
          Financial News
        </Typography>
      }
      sx={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexGrow: 1,
        ...sx
      }}
    >
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, flexGrow: 1 }}>
          <CircularProgress size={24} sx={{ color: '#0B5D32' }} />
        </Box>
      )}
      
      {/* Custom message for HTTP_402 error */}
      {isPaymentRequiredError && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4,
          px: 2,
          textAlign: 'center',
          color: '#555',
          flexGrow: 1
        }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            No financial news available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for the latest market updates and financial insights.
          </Typography>
        </Box>
      )}
      
      {/* Show other errors normally */}
      {error && !isPaymentRequiredError && (
        <Box sx={{ 
          p: 2, 
          backgroundColor: 'rgba(245, 158, 11, 0.1)', 
          borderRadius: '4px',
          color: '#B45309',
          flexGrow: 1
        }}>
          {error}
        </Box>
      )}
      
      {!loading && !error && news.length === 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 4,
          px: 2,
          textAlign: 'center',
          color: '#555',
          flexGrow: 1
        }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            No financial news available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for the latest market updates and financial insights.
          </Typography>
        </Box>
      )}
      
      {!loading && !error && news.length > 0 && (
        <Box 
          sx={{ 
            mt: 1, 
            width: '100%',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
          }}
        >
          {news.map((n, idx) => (
            <Box 
              key={idx} 
              sx={{
                py: 1.5,
                px: 1.5,
                borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none',
                '&:hover': {
                  backgroundColor: 'rgba(11, 93, 50, 0.03)'
                },
                transition: 'background-color 0.2s'
              }}
            >
              <Box sx={{ mb: 0.5 }}>
                <a 
                  href={n.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: '#0B5D32', 
                    fontWeight: 500,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'block',
                    lineHeight: 1.4
                  }}
                  onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                >
                  {n.title}
                </a>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {n.source && (
                  <Typography 
                    component="span" 
                    sx={{ 
                      fontSize: '0.75rem', 
                      color: '#666',
                      backgroundColor: 'rgba(11, 93, 50, 0.06)',
                      px: 1,
                      py: 0.3,
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}
                  >
                    {n.source}
                  </Typography>
                )}
                
                {n.published_at && (
                  <Typography 
                    component="time" 
                    sx={{ 
                      fontSize: '0.7rem', 
                      color: '#888'
                    }}
                  >
                    {new Date(n.published_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  );
}
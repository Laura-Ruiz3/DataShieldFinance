import { useEffect, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress,
  Alert,
  Typography,
  Box
} from '@mui/material';

export default function PortfolioHoldings({ portfolioId }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchHoldings = async () => {
      try {
        setLoading(true);
        // Using the existing portfolios endpoint that already has the correct query
        const res = await fetch(`/api/portfolios/${portfolioId}/holdings`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (alive) {
          setHoldings(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (alive) {
          setError(err.message || "Error fetching holdings");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    if (portfolioId) {
      fetchHoldings();
    }

    return () => { alive = false; };
  }, [portfolioId]);

  if (loading) {
    return (
      <TableContainer 
        component={Paper}
        sx={{ 
          maxHeight: 300,
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          overflow: 'auto',
          backgroundColor: '#ffffff',
          p: 2
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
          <CircularProgress sx={{ color: '#0B5D32' }} />
        </Box>
      </TableContainer>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          borderRadius: 2, 
          mb: 2 
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <TableContainer 
      component={Paper}
      sx={{ 
        maxHeight: 300,
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        overflow: 'auto',
        backgroundColor: '#ffffff',
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
        }
      }}
    >
      <Table size="small" aria-label="portfolio holdings table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell 
              sx={{ 
                backgroundColor: '#0B5D32',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                '&:first-of-type': { borderTopLeftRadius: 8 },
                '&:last-of-type': { borderTopRightRadius: 8 }
              }}
            >
              Symbol
            </TableCell>
            <TableCell 
              sx={{ 
                backgroundColor: '#0B5D32',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Name
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                backgroundColor: '#0B5D32',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Quantity
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                backgroundColor: '#0B5D32',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Price ($)
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                backgroundColor: '#0B5D32',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Fees ($)
            </TableCell>
            <TableCell 
              align="right"
              sx={{ 
                backgroundColor: '#0B5D32',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Total Value ($)
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography sx={{ py: 2, color: 'text.secondary' }}>
                  No holdings found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            holdings.map((holding) => (
              <TableRow
                key={holding.asset_id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: "background-color 0.2s ease",
                  '&:hover': { 
                    backgroundColor: '#f0fff5'
                  }
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: '#0B5D32'
                  }}
                >
                  {holding.symbol}
                </TableCell>
                <TableCell>{holding.name}</TableCell>
                <TableCell align="right">{holding.quantity}</TableCell>
                <TableCell align="right">{Number(holding.price).toFixed(2)}</TableCell>
                <TableCell align="right">{Number(holding.fees).toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                  {(Number(holding.quantity) * Number(holding.price)).toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
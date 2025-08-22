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
  Box,
  Typography
} from '@mui/material';

export default function PortfolioTable({ portfolioId }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Change the endpoint to fetch transaction data instead of assets
        const res = await fetch(`/api/transactions/${portfolioId}`);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (alive) {
          setTransactions(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (alive) {
          setError(err.message || "Error fetching transactions");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    if (portfolioId) {
      fetchTransactions();
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
      <Table size="small" aria-label="portfolio transactions table" stickyHeader>
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
              Date
            </TableCell>
            <TableCell 
              sx={{ 
                backgroundColor: '#0B5D32',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Ticker
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
              sx={{ 
                backgroundColor: '#0B5D32',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}
            >
              Type
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
              Price
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
              Fees
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center">
                <Typography sx={{ py: 2, color: 'text.secondary' }}>
                  No transactions found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow
                key={tx.transaction_id}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: "background-color 0.2s ease",
                  '&:hover': { 
                    backgroundColor: '#f0fff5'
                  }
                }}
              >
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell 
                  component="th" 
                  scope="row" 
                  sx={{ 
                    fontWeight: 'medium',
                    color: '#0B5D32'
                  }}
                >
                  {tx.symbol}
                </TableCell>
                <TableCell>{tx.name}</TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 4,
                      fontSize: '0.75rem',
                      fontWeight: 'medium',
                      backgroundColor: tx.type === 'BUY' ? 'rgba(11, 93, 50, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                      color: tx.type === 'BUY' ? '#0B5D32' : '#FF6B6B',
                    }}
                  >
                    {tx.type}
                  </Box>
                </TableCell>
                <TableCell align="right">{tx.quantity}</TableCell>
                <TableCell align="right">${Number(tx.price).toFixed(2)}</TableCell>
                <TableCell align="right">${Number(tx.fees).toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
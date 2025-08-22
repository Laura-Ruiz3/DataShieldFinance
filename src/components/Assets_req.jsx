import React, { useEffect, useState } from "react";
import { Box, Typography, Skeleton, Divider } from "@mui/material";
import Card from "./Card";

export default function PortfoliosSidebar() {
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // Si configuraste proxy en Vite, usa "/api/portfolios/user/2"
        const res = await fetch("/api/portfolios/user/2");
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        if (alive) {
          setItems(Array.isArray(data) ? data : []);
          setState({ loading: false, error: null });
        }
      } catch (err) {
        if (alive) setState({ loading: false, error: err.message || "Error" });
      }
    })();

    return () => { alive = false; };
  }, []);

  if (state.loading) {
    return (
      <Card 
        title={
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              fontWeight: 600, 
              color: '#0B5D32',
              fontFamily: '"Montserrat", "Roboto", sans-serif',
              fontSize: '1.1rem',
              paddingBottom: '8px',
              borderBottom: '2px solid #0B5D32',
              display: 'inline-block'
            }}
          >
            Portfolios
          </Typography>
        }
        sx={{
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          height: 'auto',
          alignSelf: 'start'
        }}
      >
        <Box sx={{ 
          pt: 1,
          maxHeight: '300px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#0B5D32',
            opacity: 0.7,
            borderRadius: '4px',
            '&:hover': {
              background: '#094025',
            },
          },
        }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Box 
              key={i} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                py: 1.5,
                borderTop: i > 0 ? '1px solid #f0f0f0' : 'none',
              }}
            >
              <Skeleton variant="text" width={160} height={24} />
              <Skeleton variant="text" width={100} height={24} />
            </Box>
          ))}
        </Box>
      </Card>
    );
  }

  if (state.error) {
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
              display: 'inline-block'
            }}
          >
            Portfolios
          </Typography>
        }
        sx={{
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          height: 'auto',
          alignSelf: 'start'
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            backgroundColor: 'rgba(244, 67, 54, 0.08)', 
            borderRadius: '4px',
            color: '#d32f2f',
            mt: 1
          }}
        >
          Error: {state.error}
        </Box>
      </Card>
    );
  }

  if (items.length === 0) {
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
              display: 'inline-block'
            }}
          >
            Portfolios
          </Typography>
        }
        sx={{
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          height: 'auto',
          alignSelf: 'start'
        }}
      >
        <Typography 
          sx={{ 
            fontSize: '0.875rem', 
            color: '#666',
            p: 2
          }}
        >
          There are no portfolios. Create one on the Portfolios page.
        </Typography>
      </Card>
    );
  }

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
            display: 'inline-block'
          }}
        >
          Portfolios
        </Typography>
      }
      sx={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        height: 'auto',
        alignSelf: 'start'
      }}
    >
      <Box sx={{ 
        mt: 1,
        maxHeight: '300px',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#0B5D32',
          opacity: 0.7,
          borderRadius: '4px',
          '&:hover': {
            background: '#094025',
          },
        },
      }}>
        {items.map((p, idx) => (
          <Box 
            key={p.portfolio_id} 
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              py: 1.5,
              px: 1.5,
              borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none',
              '&:hover': {
                backgroundColor: 'rgba(11, 93, 50, 0.03)'
              },
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}
            title={p.description || ""}
          >
            <Typography 
              sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#333'
              }}
            >
              {p.name}
            </Typography>
            <Typography 
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
              {new Date(p.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
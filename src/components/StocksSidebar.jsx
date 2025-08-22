import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { DUMMY_ASSETS } from '../services/dummy';

// Format currency based on currency code
const formatCurrency = (amount, currencyCode) => {
  const formatOptions = {
    USD: { style: 'currency', currency: 'USD' },
    MXN: { style: 'currency', currency: 'MXN' },
    EUR: { style: 'currency', currency: 'EUR' },
  };
  
  const options = formatOptions[currencyCode] || { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return new Intl.NumberFormat('en-US', options).format(amount);
};

// Group assets by type
const assetsByType = DUMMY_ASSETS.reduce((acc, asset) => {
  if (!acc[asset.asset_type]) {
    acc[asset.asset_type] = [];
  }
  acc[asset.asset_type].push(asset);
  return acc;
}, {});

export default function AssetsSidebar() {
  const [activeTab, setActiveTab] = useState('stock');
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Card elevation={2} sx={{ 
      mb: 2,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
    }}>
      <Box sx={{ p: 2, pb: 0 }}>
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
          Financial Assets
        </Typography>
      </Box>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ px: 2, mt: 1 }}
      >
        {Object.keys(assetsByType).map(type => (
          <Tab key={type} value={type} label={type.charAt(0).toUpperCase() + type.slice(1)} />
        ))}
      </Tabs>
      <CardContent sx={{ pt: 1 }}>
        <List disablePadding>
          {assetsByType[activeTab]?.map((asset, index) => (
            <React.Fragment key={asset.symbol}>
              {index > 0 && <Divider />}
              <ListItem sx={{ py: 1 }} disableGutters>
                <ListItemText 
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {asset.symbol} - {asset.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {asset.sector} • {asset.currency}
                    </Typography>
                  }
                />
                <Box textAlign="right">
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 'medium'
                    }}
                  >
                    {formatCurrency(asset.price, asset.currency)}
                  </Typography>
                  {asset.change !== undefined && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: asset.change >= 0 ? 'success.main' : 'error.main',
                        display: 'block'
                      }}
                    >
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </Typography>
                  )}
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
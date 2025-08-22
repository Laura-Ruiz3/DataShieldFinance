/**
 * Financial Data Client
 * 
 * A client for accessing financial data from various API providers including
 * Finnhub, Marketaux, and AlphaVantage.
 * 
 * @module services/financial-data-client
 */

"use strict";

const finnhub = require("finnhub");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Finnhub API client instance
 * @type {finnhub.DefaultApi}
 */
const finnhubClient = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY);

/**
 * Converts callback-based Finnhub API methods to Promise-based
 * 
 * @param {Function} callback - The Finnhub API method to wrap
 * @returns {Promise<any>} Promise that resolves with the API response
 * @private
 */
function asPromiseAPI(callback) {
  return new Promise((resolve, reject) => {
    callback((error, data, response) => {
      if (error) reject(error);
      else resolve(data);
    });
  });
}

/** 
 * Marketaux API key from environment variables
 * @type {string}
 */
const API_KEY = process.env.VITE_MARKETAUX_API_KEY;

/**
 * Parse raw Marketaux API response into a standardized format
 * 
 * @param {Object} json - Raw JSON response from Marketaux API
 * @returns {Array} Normalized news article data
 * @private
 */
function parseMarketauxResponse(json) {
  if (!json || !Array.isArray(json.data)) return [];
  
  return json.data
    .map((item) => ({
      title: item?.title ?? '(sin título)',
      url: item?.url ?? '#',
      source: (item?.source && (item.source.name || item.source)) || 'Fuente',
      published_at: item?.published_at || null,
    }))
    .filter((x) => !!x.title && !!x.url);
}

/**
 * Fetch news from Marketaux API
 * 
 * @param {Object} options - Options for fetching news
 * @param {string} [options.countries='mx'] - Country code filter
 * @param {string} [options.language='es'] - Language code filter
 * @param {number} [options.limit=6] - Maximum number of news items to return
 * @returns {Promise<Object>} Object with status and news data
 * @private
 */
async function fetchNewsMX({ countries = 'mx', language = 'es', limit = 6 } = {}) {
  if (!API_KEY) return { ok: false, reason: 'NO_KEY' };
  
  const url = new URL('https://api.marketaux.com/v1/news/all');
  url.search = new URLSearchParams({ 
    api_token: API_KEY, 
    countries, 
    language, 
    limit: String(limit) 
  }).toString();
  
  const res = await fetch(url.toString());
  if (!res.ok) return { ok: false, reason: 'HTTP_' + res.status };
  
  const json = await res.json();
  const normalized = parseMarketauxResponse(json);
  
  return { ok: true, data: normalized };
}

/**
 * Get financial news articles in Spanish from Mexico
 * 
 * @returns {Promise<Object>} Object with status and news data
 */
function noticias() {
  return fetchNewsMX();
}

/**
 * Get real-time quote data for a symbol
 * 
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Quote data
 */
function quote(symbol) {
  return asPromiseAPI(finnhubClient.quote.bind(finnhubClient, symbol));
}

/**
 * Get company basic financials
 * 
 * @param {string} symbol - Stock symbol
 * @param {string} metric - Financial metric to retrieve
 * @returns {Promise<Object>} Financial data
 */
function companyBasicFinancials(symbol, metric) {
  return asPromiseAPI(finnhubClient.companyBasicFinancials.bind(finnhubClient, symbol, metric));
}

/**
 * Get company earnings data
 * 
 * @param {string} symbol - Stock symbol
 * @param {Object} [options] - Additional options
 * @returns {Promise<Object>} Earnings data
 */
function companyEarnings(symbol, options) {
  return asPromiseAPI(finnhubClient.companyEarnings.bind(finnhubClient, symbol, options));
}

/**
 * Get company profile information
 * 
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Company profile data
 */
function companyProfile2(options) {
  return asPromiseAPI(finnhubClient.companyProfile2.bind(finnhubClient, options));
}

/**
 * Get country metadata from Finnhub
 * 
 * @returns {Promise<Array>} List of countries
 */
function country() {
  return asPromiseAPI(finnhubClient.country.bind(finnhubClient));
}

/**
 * Get upcoming earnings calendar
 * 
 * @param {Object} [options] - Query options
 * @returns {Promise<Array>} Earnings calendar events
 */
function earningsCalendar(options) {
  return asPromiseAPI(finnhubClient.earningsCalendar.bind(finnhubClient, options));
}

/**
 * Get company SEC filings
 * 
 * @param {Object} options - Query options
 * @returns {Promise<Array>} SEC filings
 */
function filings(options) {
  return asPromiseAPI(finnhubClient.filings.bind(finnhubClient, options));
}

/**
 * Get company financial reports
 * 
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Financial report data
 */
function financialsReported(options) {
  return asPromiseAPI(finnhubClient.financialsReported.bind(finnhubClient, options));
}

/**
 * Get market news by category
 * 
 * @param {string} category - News category
 * @param {Object} [options] - Additional options
 * @returns {Promise<Array>} News articles
 */
function marketNews(category, options) {
  return asPromiseAPI(finnhubClient.marketNews.bind(finnhubClient, category, options));
}

/**
 * Get analyst recommendation trends for a symbol
 * 
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Array>} Recommendation trends
 */
function recommendationTrends(symbol) {
  return asPromiseAPI(finnhubClient.recommendationTrends.bind(finnhubClient, symbol));
}

/**
 * Get daily time series data from AlphaVantage API
 * 
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Daily time series data
 */
async function getTimeSeriesDaily(symbol) {
  return (await fetch(
    `http://alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.ALPHAVANTAGE_API_KEY}`
  )).json();
}

/**
 * Get current stock prices for multiple symbols
 * 
 * @param {string[]} symbols - Array of stock symbols
 * @returns {Promise<Object>} Object mapping symbols to their price data
 */
async function getStockPrices(symbols) {
  try {
    // This is a placeholder implementation - in a real app, you would call an actual API
    // For demonstration purposes, we're generating random price data
    const result = {};
    for (const symbol of symbols) {
      result[symbol] = {
        price: Math.random() * 1000 + 10,
        changePercent: (Math.random() * 10) - 5
      };
    }
    return result;
  } catch (error) {
    console.error("Error fetching stock prices:", error);
    return {};
  }
}

module.exports = { 
  noticias, 
  marketNews, 
  quote, 
  companyBasicFinancials,
  companyEarnings, 
  companyProfile2, 
  country,
  earningsCalendar, 
  filings, 
  financialsReported,
  recommendationTrends, 
  getTimeSeriesDaily,
  getStockPrices
};
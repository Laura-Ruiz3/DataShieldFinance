/**
 * Marketaux API Client
 * 
 * A client for accessing financial news from the Marketaux API.
 * 
 * @module services/marketaux
 */

/**
 * API key from environment variables
 * @type {string}
 */
const API_KEY = import.meta.env.VITE_MARKETAUX_API_KEY;

/**
 * Parse raw Marketaux API response into a standardized format
 * 
 * @param {Object} json - Raw JSON response from Marketaux API
 * @returns {Array} Normalized news article data
 */
export function parseMarketauxResponse(json) {
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
 * Fetch financial news from Marketaux API
 * 
 * @param {Object} options - Options for fetching news
 * @param {string} [options.countries='mx'] - Country code filter
 * @param {string} [options.language='es'] - Language code filter
 * @param {number} [options.limit=6] - Maximum number of news items to return
 * @returns {Promise<Object>} Object with status and news data
 * @example
 * // Get 10 news items from Mexico in Spanish
 * const result = await fetchNewsMX({ limit: 10 });
 * if (result.ok) {
 *   console.log(result.data);
 * }
 */
export async function fetchNewsMX({ countries = 'mx', language = 'es', limit = 6 } = {}) {
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
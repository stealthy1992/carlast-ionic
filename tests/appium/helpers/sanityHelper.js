
const SCHEMA_TYPES = {
  sale: 'carsforsale',
  rent: 'carsforrent',
};

// ✅ Projections removed from the URL query string entirely.
// Sanity's REST API struggles with complex projections containing
// nested braces and quoted keys when URL-encoded in a GET query param.
// Instead we fetch all fields (*) and let the test files work with
// the full document — this is simpler and never causes 400 errors.
// If you want field filtering, use Sanity's POST query endpoint instead.

async function fetchCars(category) {

const PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID;
const DATASET    = process.env.VITE_SANITY_DATASET
                || 'production';
const API_TOKEN  = process.env.VITE_SANITY_TOKEN
const API_VER    = '2021-10-21';

if (!PROJECT_ID) throw new Error('SANITY_PROJECT_ID is not set');
if (!DATASET)    throw new Error('SANITY_DATASET is not set');
  

const schemaType = SCHEMA_TYPES[category];
// The query for fetching the whole document is commented following
// const rawQuery = `*[_type == "${schemaType}"]`
const rawQuery = `*[_type == "${schemaType}"]`;
  
const query    = encodeURIComponent(rawQuery);

  
const url = `https://${PROJECT_ID}.api.sanity.io/v${API_VER}/data/query/${DATASET}?query=${query}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` })
    }
  });

  if (!response.ok) {
    let body = '';
    try { body = await response.text(); } catch(e) {}
    throw new Error(
      `Sanity API error: ${response.status} ${response.statusText} — ${body}`
    );
  }

  const { result } = await response.json();
  return result;
}


function refToUrl(ref) {
  if (!ref) return null;
  const withoutPrefix = ref.replace('image-', '');
  const parts         = withoutPrefix.split('-');
  const extension     = parts.pop();
  const rest          = parts.join('-');
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${rest}.${extension}`;
}

async function fetchCarsForSale() { return fetchCars('sale'); }
async function fetchCarsForRent() { return fetchCars('rent'); }

module.exports = { fetchCarsForSale, fetchCarsForRent, refToUrl };
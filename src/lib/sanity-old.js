import sanityClient from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'bushe0bq'
const dataset = import.meta.env.VITE_SANITY_DATASET || 'production'
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2022-03-10'
const rentApiUrl = import.meta.env.VITE_RENT_API_URL || '/api/submit-rent'

export const client = sanityClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
})

const builder = imageUrlBuilder(client)
const apiBase = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`

async function sanityFetch(query, params = {}) {
  const search = new URLSearchParams({ query })
  Object.entries(params).forEach(([key, value]) => {
    search.set(`$${key}`, JSON.stringify(value))
  })

  const response = await fetch(`${apiBase}?${search.toString()}`)
  if (!response.ok) {
    throw new Error(`Sanity request failed: ${response.status}`)
  }

  const payload = await response.json()
  return payload.result
}

export const urlFor = (source) => {
  if (!source) return ''
  return builder.image(source).auto('format').fit('max').url()
}

export async function fetchHomeData() {
  const query = `{
    "banner": *[_type == "banner"][0],
    "footerBanner": *[_type == "footerBanner"][0],
    "saleCars": *[_type == "carsforsale"] | order(_createdAt desc),
    "rentCars": *[_type == "carsforrent"] | order(_createdAt desc)
  }`

  return sanityFetch(query)
}

export function fetchCarBySlug(type, slug) {
  const docType = type === 'sale' ? 'carsforsale' : 'carsforrent'
  return sanityFetch(`*[_type == $docType && slug.current == $slug][0]`, {
    docType,
    slug,
  })
}

export async function submitRentApplication({ customerName, email, carName, rentDays, certificate }) {
  const formData = new FormData()
  formData.append('customerName', customerName)
  formData.append('email', email)
  formData.append('carName', carName)
  formData.append('rentDays', rentDays)
  formData.append('clearanceCertificate', certificate)

  const response = await fetch(rentApiUrl, {
    method: 'POST',
    body: formData,
  })

  const result = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(result.message || 'Rent application failed')
  }

  return result
}

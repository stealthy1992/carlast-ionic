import fs from 'fs'
import formidable from 'formidable'
import nodemailer from 'nodemailer'
import sanityClient from '@sanity/client'

export const config = {
  api: {
    bodyParser: false,
  },
}

const serverClient = sanityClient({
  projectId: process.env.SANITY_PROJECT_ID || 'bushe0bq',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2022-03-10',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

const allowedOrigins = new Set([
  'https://localhost',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://carlast.vercel.app',
])

if (process.env.APP_ORIGIN) {
  allowedOrigins.add(process.env.APP_ORIGIN)
}

if (process.env.APP_ORIGINS) {
  process.env.APP_ORIGINS
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .forEach((origin) => allowedOrigins.add(origin))
}

function setCors(req, res) {
  const origin = req.headers.origin

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function createTransporter() {
  if (process.env.ENABLE_TEST_EMAIL === 'true') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    })
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

function firstField(value) {
  return Array.isArray(value) ? value[0] : value
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function validateEnvironment() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    return 'Server missing SANITY_WRITE_TOKEN'
  }

  if (process.env.ENABLE_TEST_EMAIL === 'true') {
    if (!process.env.ETHEREAL_USER || !process.env.ETHEREAL_PASS) {
      return 'Server missing Ethereal email credentials'
    }
    return null
  }

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return 'Server missing Gmail credentials'
  }

  return null
}

export default async function handler(req, res) {
  setCors(req, res)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const envError = validateEnvironment()
  if (envError) {
    return res.status(500).json({ message: envError })
  }

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 })

  form.parse(req, async (parseError, fields, files) => {
    if (parseError) {
      console.error('Form parse error:', parseError)
      return res.status(400).json({ message: 'Error parsing form data' })
    }

    const customerName = firstField(fields.customerName)
    const email = firstField(fields.email)
    const carName = firstField(fields.carName)
    const rentDays = firstField(fields.rentDays)
    const file = firstField(files.clearanceCertificate)

    if (!customerName?.trim() || !email?.trim() || !carName || !rentDays || !file) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const fileBuffer = fs.readFileSync(file.filepath)
      const uploadedAsset = await serverClient.assets.upload(
        file.mimetype?.includes('image') ? 'image' : 'file',
        fileBuffer,
        {
          filename: file.originalFilename,
          contentType: file.mimetype,
        },
      )

      const doc = await serverClient.create({
        _type: 'userForms',
        customerName: customerName.trim(),
        email: email.trim(),
        carName,
        rentDays: Number(rentDays),
        clearanceCertificate: {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: uploadedAsset._id,
          },
        },
        submittedAt: new Date().toISOString(),
        status: 'pending',
      })

      const safeCustomerName = escapeHtml(customerName.trim())
      const safeEmail = email.trim()
      const safeCarName = escapeHtml(carName)
      const safeRentDays = escapeHtml(rentDays)

      const transporter = createTransporter()
      const sentInfo = await transporter.sendMail({
        from: `"Car Rentals" <${process.env.GMAIL_USER}>`,
        to: safeEmail,
        subject: `Rent Application Received - ${carName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">Application Received</h2>
            <p>Hi <strong>${safeCustomerName}</strong>,</p>
            <p>We have received your rental application. Here's a summary:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Car</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${safeCarName}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Rent Days</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${safeRentDays} day(s)</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Status</td>
                <td style="padding: 10px; border: 1px solid #ddd;">Pending Review</td>
              </tr>
            </table>
            <p>Our team will review your application and Police Clearance Certificate.</p>
            <p style="color: #888; font-size: 13px; margin-top: 32px;">This is an automated message. Please do not reply.</p>
          </div>
        `,
      })

      const previewUrl = process.env.ENABLE_TEST_EMAIL === 'true'
        ? nodemailer.getTestMessageUrl(sentInfo)
        : null

      return res.status(200).json({
        success: true,
        documentId: doc._id,
        email: {
          sent: true,
          messageId: sentInfo.messageId || null,
          accepted: sentInfo.accepted || [],
          rejected: sentInfo.rejected || [],
          previewUrl,
        },
      })
    } catch (error) {
      console.error('Submission error:', error)
      return res.status(500).json({
        message: 'Submission failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  })
}
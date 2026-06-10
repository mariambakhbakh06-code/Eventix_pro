//server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const bcrypt = require("bcryptjs");
require('dotenv').config();

const app = express();

// ================= AUTH MIDDLEWARE =================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ================= CORS CONFIGURATION =================
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Serveur fonctionne ");
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/Billet_Database')
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ================= EMAIL CONFIGURATION =================
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

emailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server ready to send messages');
  }
});

// ================= HELPER FUNCTIONS =================
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidMoroccanPhone(phone) {
  const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
  return phoneRegex.test(phone);
}

function generateTicketCode() {
  return `TKT-${uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
}

// ================= QR CODE GENERATION =================
async function generateTicketQRCode(ticketCode, bookingDetails) {
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const ticketUrl = `${baseUrl}/api/ticket/${ticketCode}`;
    
    const qrCodeDataURL = await QRCode.toDataURL(ticketUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    const qrCodeBuffer = await QRCode.toBuffer(ticketUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300
    });
    
    return { qrCodeDataURL, qrCodeBuffer, ticketUrl };
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
}

// ================= SEND TICKET EMAIL =================
async function sendTicketEmail(customerEmail, bookingDetails, qrCodeBuffer, ticketUrl) {
  try {
    const attendeesList = bookingDetails.attendees.map((attendee, index) => 
      `${index + 1}. ${attendee.firstName} ${attendee.lastName}<br>📧 ${attendee.email}<br>📱 ${attendee.phone}`
    ).join('<br><br>');
    
    const mailOptions = {
      from: `"EVENTIX Tickets" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `🎫 Your Tickets for ${bookingDetails.eventName} - ${bookingDetails.ticketCode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .ticket-card {
              background: white;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .qr-code {
              text-align: center;
              margin: 20px 0;
              padding: 20px;
              background: white;
              border-radius: 10px;
            }
            .ticket-code {
              background: #f0f0f0;
              padding: 10px;
              text-align: center;
              font-size: 20px;
              font-weight: bold;
              letter-spacing: 2px;
              border-radius: 5px;
              margin: 15px 0;
            }
            .event-details {
              margin: 20px 0;
            }
            .event-details h3 {
              color: #667eea;
              margin-bottom: 10px;
            }
            .attendees {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎫 EVENTIX TICKETS</h1>
            <p>Your booking is confirmed!</p>
          </div>
          
          <div class="content">
            <div class="ticket-card">
              <h2>${bookingDetails.eventName}</h2>
              
              <div class="ticket-code">
                Ticket Code: ${bookingDetails.ticketCode}
              </div>
              
              <div class="event-details">
                <h3>📅 Event Details</h3>
                <p><strong>Date:</strong> ${bookingDetails.eventDate}</p>
                <p><strong>Time:</strong> ${bookingDetails.eventTime}</p>
                <p><strong>Venue:</strong> ${bookingDetails.venue}</p>
                <p><strong>City:</strong> ${bookingDetails.city}</p>
                <p><strong>Quantity:</strong> ${bookingDetails.quantity} ticket(s)</p>
                <p><strong>Total Price:</strong> ${bookingDetails.totalPrice} MAD</p>
              </div>
              
              <div class="attendees">
                <h3>👥 Attendee Information</h3>
                ${attendeesList}
              </div>
              
              <div class="qr-code">
                <h3>📱 Scan QR Code for Entry</h3>
                <p>Please present this QR code at the venue entrance</p>
                <img src="cid:ticketQRCode" alt="Ticket QR Code" style="max-width: 250px; margin: 10px auto;">
                <br>
                <a href="${ticketUrl}" class="button">🎫 View Digital Ticket</a>
              </div>
            </div>
            
            <div class="footer">
              <p>⚠️ Please keep this email as proof of purchase</p>
              <p>For any inquiries, contact us at support@eventix.com</p>
              <p>Thank you for choosing EVENTIX! 🎉</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `ticket-${bookingDetails.ticketCode}.png`,
          content: qrCodeBuffer,
          cid: 'ticketQRCode'
        }
      ]
    };
    
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, error: error.message };
  }
}

// ================= SEND ORGANIZER STATUS EMAIL =================
async function sendOrganizerStatusEmail(organizerEmail, status, reason = '') {
  try {
    const subject = status === 'accepted' 
      ? '🎉 Your Organizer Application has been Accepted!' 
      : '📋 Update on Your Organizer Application';
    
    const html = status === 'accepted'
      ? `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Congratulations!</h1>
          </div>
          <div class="content">
            <h2>Your organizer application has been ACCEPTED!</h2>
            <p>You can now start creating events on EVENTIX.</p>
            <p>Log in to your organizer dashboard to get started.</p>
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/organizer/dashboard" class="button">Go to Dashboard</a>
          </div>
        </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Update on Your Application</h1>
          </div>
          <div class="content">
            <h2>We regret to inform you...</h2>
            <p>Your organizer application has been <strong>REFUSED</strong>.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>You can reapply after addressing the issues mentioned above.</p>
            <p>Thank you for your interest in EVENTIX.</p>
          </div>
        </body>
        </html>
      `;
    
    const mailOptions = {
      from: `"EVENTIX Admin" <${process.env.EMAIL_USER}>`,
      to: organizerEmail,
      subject: subject,
      html: html
    };
    
    await emailTransporter.sendMail(mailOptions);
    console.log(`📧 Status email sent to ${organizerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send status email:', error);
    return { success: false, error: error.message };
  }
}

// ================= TICKET DISPLAY PAGE =================
app.get('/api/ticket/:ticketCode', async (req, res) => {
  try {
    const { ticketCode } = req.params;
    
    const booking = await Booking.findOne({ ticketCode }).populate('eventId');
    
    if (!booking) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
            }
            .error-container {
              text-align: center;
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              max-width: 400px;
            }
            h1 { color: #dc3545; margin-bottom: 20px; }
            p { color: #666; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>❌ Ticket Not Found</h1>
            <p>Invalid ticket code or ticket does not exist.</p>
            <p>Please contact support if you believe this is an error.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    const event = booking.eventId;
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const ticketUrl = `${baseUrl}/api/ticket/${ticketCode}`;
    const qrCodeDataURL = await QRCode.toDataURL(ticketUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 200,
      color: {
        dark: '#667eea',
        light: '#ffffff'
      }
    });
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
        <title>${escapeHtml(booking.eventName)} - Ticket</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .ticket-container {
            max-width: 500px;
            width: 100%;
            margin: 0 auto;
            animation: fadeIn 0.5s ease-out;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .ticket-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
          }
          
          .ticket-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            position: relative;
          }
          
          .ticket-header h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .ticket-code {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 50px;
            display: inline-block;
            font-family: monospace;
            font-size: 14px;
            letter-spacing: 1px;
            margin-top: 10px;
          }
          
          .ticket-content {
            padding: 30px;
          }
          
          .event-title {
            font-size: 28px;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
            word-wrap: break-word;
          }
          
          .info-section {
            margin: 25px 0;
          }
          
          .info-row {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .info-icon {
            font-size: 24px;
            min-width: 50px;
            text-align: center;
          }
          
          .info-text {
            flex: 1;
          }
          
          .info-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }
          
          .info-value {
            font-size: 16px;
            color: #333;
            font-weight: 500;
            word-wrap: break-word;
          }
          
          .attendees-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
          }
          
          .attendees-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #667eea;
          }
          
          .attendee-item {
            padding: 12px;
            background: white;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          .attendee-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          
          .attendee-details {
            font-size: 14px;
            color: #666;
          }
          
          .price-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 20px 0;
          }
          
          .price-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          
          .price-value {
            font-size: 32px;
            font-weight: bold;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            margin-top: 15px;
          }
          
          .status-confirmed {
            background: #d4edda;
            color: #155724;
          }
          
          .qr-section {
            text-align: center;
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
          }
          
          .qr-section h3 {
            color: #667eea;
            margin-bottom: 15px;
          }
          
          .qr-section img {
            max-width: 200px;
            border: 2px solid #667eea;
            border-radius: 10px;
            padding: 10px;
            background: white;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e0e0e0;
          }
          
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 15px;
            transition: transform 0.2s;
            cursor: pointer;
            border: none;
            font-size: 14px;
          }
          
          .button:hover {
            transform: translateY(-2px);
          }
          
          @media (max-width: 480px) {
            .ticket-content {
              padding: 20px;
            }
            
            .event-title {
              font-size: 22px;
            }
            
            .info-value {
              font-size: 14px;
            }
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .ticket-card {
              box-shadow: none;
            }
            
            .button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-card">
            <div class="ticket-header">
              <h1>🎫 EVENTIX TICKET</h1>
              <div class="ticket-code">${escapeHtml(booking.ticketCode)}</div>
            </div>
            
            <div class="ticket-content">
              <div class="event-title">${escapeHtml(booking.eventName)}</div>
              
              <div class="info-section">
                <div class="info-row">
                  <div class="info-icon">📅</div>
                  <div class="info-text">
                    <div class="info-label">DATE</div>
                    <div class="info-value">${escapeHtml(eventDate)}</div>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-icon">⏰</div>
                  <div class="info-text">
                    <div class="info-label">TIME</div>
                    <div class="info-value">${escapeHtml(event.time)}</div>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-icon">📍</div>
                  <div class="info-text">
                    <div class="info-label">VENUE</div>
                    <div class="info-value">${escapeHtml(event.venue)}</div>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-icon">🏙️</div>
                  <div class="info-text">
                    <div class="info-label">CITY</div>
                    <div class="info-value">${escapeHtml(event.city)}</div>
                  </div>
                </div>
                
                <div class="info-row">
                  <div class="info-icon">👥</div>
                  <div class="info-text">
                    <div class="info-label">TICKETS</div>
                    <div class="info-value">${booking.totalQuantity} ticket(s)</div>
                  </div>
                </div>
              </div>
              
              <div class="attendees-section">
                <div class="attendees-title">📋 Attendee Information</div>
                ${booking.attendees.map((attendee, index) => `
                  <div class="attendee-item">
                    <div class="attendee-name">${index + 1}. ${escapeHtml(attendee.firstName)} ${escapeHtml(attendee.lastName)}</div>
                    <div class="attendee-details">
                      📧 ${escapeHtml(attendee.email)}<br>
                      📱 ${escapeHtml(attendee.phone)}
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="price-section">
                <div class="price-label">TOTAL PAID</div>
                <div class="price-value">${booking.totalPrice} MAD</div>
              </div>
              
              <div class="status-badge status-confirmed">
                ✓ CONFIRMED
              </div>
              
              <div class="qr-section">
                <h3>📱 QR Code</h3>
                <img src="${qrCodeDataURL}" alt="Ticket QR Code">
                <p style="margin-top: 10px; font-size: 14px; color: #666;">Present this QR code at the venue entrance</p>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.print();" class="button">
                  🖨️ Print Ticket
                </button>
              </div>
            </div>
            
            <div class="footer">
              <p>⚠️ Please present this ticket (digital or printed) at the venue entrance</p>
              <p>Valid ID required for entry</p>
              <p>Booked on: ${new Date(booking.createdAt).toLocaleDateString()}</p>
              <p style="margin-top: 10px;">For inquiries: support@eventix.com</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    res.send(html);
  } catch (error) {
    console.error('Ticket display error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .error-container {
            text-align: center;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 400px;
          }
          h1 { color: #dc3545; margin-bottom: 20px; }
          p { color: #666; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="error-container">
          <h1>❌ Error Loading Ticket</h1>
          <p>Unable to load ticket information. Please try again later.</p>
          <p>Error: ${escapeHtml(error.message)}</p>
        </div>
      </body>
      </html>
    `);
  }
});

// ================= DATABASE SCHEMAS =================

// Event Schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String, required: true, trim: true },
  venue: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  category: {
    type: String,
    enum: ['sport', 'musical', 'cinema', 'education'],
    default: 'musical'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  contactPerson: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true }
  },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  eventName: { type: String, required: true },
  totalQuantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  ticketCode: { type: String, unique: true, required: true },
  attendees: [{
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    seatNumber: { type: String, default: '' },
    specialRequests: { type: String, default: '' }
  }],
  qrCodeData: { type: String },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Customer Schema
const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  acceptTerms: { type: Boolean, required: true, default: false },
  signedInAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
  totalBookings: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);

// Organizer Schema
const organizerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  photo: { type: String, required: true },
  rooms: { type: Number, required: true },
  password: { type: String, required: true },
  earnings: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "refused"],
    default: "pending"
  },
  rejectionReason: { type: String, default: "" },
  acceptedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Organizer = mongoose.model("Organizer", organizerSchema);

// ================= ORGANIZER ROUTES =================

app.post("/api/organizers/signin", async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      phone,
      photo,
      rooms,
      earnings
    } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters"
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required"
      });
    }

    if (!address || address.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Valid address is required"
      });
    }

    if (!phone || !isValidMoroccanPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Valid Moroccan phone number is required (e.g., 0612345678 or +212612345678)"
      });
    }

    if (!photo || !photo.match(/^(http|https):\/\/[^ "]+$/)) {
      return res.status(400).json({
        success: false,
        message: "Valid photo URL is required"
      });
    }

    if (!rooms || rooms < 1) {
      return res.status(400).json({
        success: false,
        message: "Number of rooms must be at least 1"
      });
    }

    if (!earnings || ![90, 95].includes(Number(earnings))) {
      return res.status(400).json({
        success: false,
        message: "Earnings must be 90% or 95%"
      });
    }

    const existingOrganizer = await Organizer.findOne({
      email: email.toLowerCase()
    });

    if (existingOrganizer) {
      return res.status(400).json({
        success: false,
        message: "An organizer with this email already exists"
      });
    }

    const organizer = new Organizer({
      name: name.trim(),
      email: email.toLowerCase(),
      address: address.trim(),
      phone,
      photo,
      rooms: Number(rooms),
      earnings: Number(earnings),
      status: "pending"
    });

    await organizer.save();

    res.status(201).json({
      success: true,
      message: "Organizer request sent successfully. You will receive a confirmation email once approved.",
      data: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        status: organizer.status
      }
    });

  } catch (err) {
    console.error("Organizer sign-in error:", err);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
});

app.get("/api/organizers/pending", async (req, res) => {
  try {
    const organizers = await Organizer.find({
      status: "pending"
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: organizers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.get("/api/organizers/all", async (req, res) => {
  try {
    const organizers = await Organizer.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: organizers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.get("/api/organizers/status/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    const organizer = await Organizer.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found"
      });
    }
    
    res.json({
      success: true,
      data: {
        status: organizer.status,
        name: organizer.name,
        email: organizer.email,
        createdAt: organizer.createdAt,
        rejectionReason: organizer.rejectionReason
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.put("/api/organizers/:id/accept", async (req, res) => {
  try {
    const organizer = await Organizer.findByIdAndUpdate(
      req.params.id,
      {
        status: "accepted",
        acceptedAt: new Date()
      },
      { new: true }
    );

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found"
      });
    }

    // Send acceptance email
    await sendOrganizerStatusEmail(organizer.email, 'accepted');

    res.json({
      success: true,
      message: "Organizer accepted successfully",
      data: organizer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

app.put("/api/organizers/:id/refuse", async (req, res) => {
  try {
    const { reason } = req.body;
    
    const organizer = await Organizer.findByIdAndUpdate(
      req.params.id,
      {
        status: "refused",
        rejectionReason: reason || "No reason provided"
      },
      { new: true }
    );

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found"
      });
    }

    // Send rejection email
    await sendOrganizerStatusEmail(organizer.email, 'refused', reason);

    res.json({
      success: true,
      message: "Organizer refused",
      data: organizer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// ================= CONVERSATION STATE MANAGEMENT =================
const conversationSessions = new Map();

const ConversationState = {
  IDLE: 'idle',
  SHOWING_EVENTS: 'showing_events',
  SELECTING_EVENT: 'selecting_event',
  ASKING_QUANTITY: 'asking_quantity',
  COLLECTING_ATTENDEE_INFO: 'collecting_attendee_info',
  CONFIRMING_BOOKING: 'confirming_booking'
};

// ================= SIMPLE RULE-BASED PARSER =================
function parseMessage(message) {
  const text = message.toLowerCase().trim();
  
  const isNumber = /^\d+$/.test(text);
  const numberValue = isNumber ? parseInt(text) : null;
  
  const categoryKeywords = {
    musical: ['concert', 'music', 'musical', 'festival', 'gig', 'show', 'live', 'dj', 'band'],
    sport: ['sport', 'football', 'match', 'game', 'basket', 'tennis', 'league', 'team'],
    cinema: ['cinema', 'movie', 'film', 'projection', 'screening'],
    education: ['education', 'conference', 'workshop', 'seminar', 'training', 'course']
  };
  
  let category = null;
  for (const [key, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(word => text.includes(word))) {
      category = key;
      break;
    }
  }
  
  const cities = {
    casablanca: ['casablanca', 'casa'],
    rabat: ['rabat'],
    marrakech: ['marrakech', 'marrakesh'],
    fes: ['fes', 'fez'],
    tanger: ['tanger', 'tangier'],
    agadir: ['agadir']
  };
  
  let city = null;
  for (const [key, variations] of Object.entries(cities)) {
    if (variations.some(v => text.includes(v))) {
      city = key.charAt(0).toUpperCase() + key.slice(1);
      break;
    }
  }
  
  let maxPrice = null;
  if (!isNumber || text.includes('under') || text.includes('less') || text.includes('mad') || text.includes('dh')) {
    const pricePatterns = [
      /(\d+)\s*(mad|dh|dhs|dirhams?)/i,
      /under\s*(\d+)/i,
      /less than\s*(\d+)/i,
      /moins de\s*(\d+)/i,
      /<\s*(\d+)/i,
      /max\s*(\d+)/i
    ];
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        maxPrice = parseInt(match[1]);
        break;
      }
    }
  }
  
  const isBooking = text.includes('book') || text.includes('reserve');
  const isYes = /^yes$|^yeah$|^confirm$|^ok$|^okay$/i.test(text);
  const isNo = /^no$|^cancel$|^nevermind$/i.test(text);
  
  const result = { 
    category, 
    city, 
    maxPrice, 
    isBooking,
    isNumber,
    numberValue,
    isYes,
    isNo,
    rawText: text
  };
  
  console.log("📦 Parsed result:", result);
  return result;
}

// ================= BUILD QUERY =================
function buildMongoQuery(filters) {
  let query = {};
  if (filters.category) query.category = filters.category;
  if (filters.city) query.city = filters.city;
  if (filters.maxPrice) {
    query.price = { $lte: filters.maxPrice };
  }
  query.availableSeats = { $gt: 0 };
  return query;
}

// ================= CONVERSATIONAL HANDLER =================
async function handleConversation(message, sessionId, userEmail) {
  const parsed = parseMessage(message);
  
  if (!conversationSessions.has(sessionId)) {
    conversationSessions.set(sessionId, {
      state: ConversationState.IDLE,
      preferences: {
        category: null,
        city: null,
        maxPrice: null,
        selectedEvent: null,
        quantity: null,
        attendees: []
      },
      lastSearchResults: [],
      currentAttendeeIndex: 0,
      currentAttendee: {},
      lastSearchQuery: null
    });
  }
  
  const session = conversationSessions.get(sessionId);
  console.log(`Current state: ${session.state}`);
  
  switch (session.state) {
    case ConversationState.SELECTING_EVENT:
      if (parsed.isNumber && parsed.numberValue >= 1 && parsed.numberValue <= session.lastSearchResults.length) {
        session.preferences.selectedEvent = session.lastSearchResults[parsed.numberValue - 1];
        session.state = ConversationState.ASKING_QUANTITY;
        return {
          reply: `🎉 Great choice!\n\nEvent: ${session.preferences.selectedEvent.name}\nPrice: ${session.preferences.selectedEvent.price} MAD\nAvailable: ${session.preferences.selectedEvent.availableSeats} seats\n\nHow many tickets would you like to book?`,
          shouldSearch: false
        };
      } else if (parsed.isBooking) {
        const eventsList = session.lastSearchResults.map((e, i) => 
          `${i+1}. ${e.name} - ${e.price} MAD - ${e.city}`
        ).join('\n');
        return {
          reply: `Please select an event number (1-${session.lastSearchResults.length}):\n\n${eventsList}`,
          shouldSearch: false
        };
      }
      break;
      
    case ConversationState.ASKING_QUANTITY:
      if (parsed.isNumber && parsed.numberValue > 0 && parsed.numberValue <= session.preferences.selectedEvent.availableSeats) {
        session.preferences.quantity = parsed.numberValue;
        session.state = ConversationState.COLLECTING_ATTENDEE_INFO;
        session.currentAttendeeIndex = 1;
        session.preferences.attendees = [];
        session.currentAttendee = {};
        return {
          reply: `✅ ${parsed.numberValue} ticket(s).\n\nNow let me get the attendee information.\n\n📝 **Attendee ${session.currentAttendeeIndex} of ${parsed.numberValue}**\n\nFull name (First and Last):`,
          shouldSearch: false
        };
      } else {
        return {
          reply: `Please enter a valid number (1-${session.preferences.selectedEvent.availableSeats} tickets available):`,
          shouldSearch: false
        };
      }
      
    case ConversationState.COLLECTING_ATTENDEE_INFO:
      return await handleAttendeeCollection(message, parsed, session);
      
    case ConversationState.CONFIRMING_BOOKING:
      if (parsed.isYes) {
        if (!userEmail) {
          return {
            reply: `🔐 Please sign in to book tickets.\n\nWould you like to sign in now?`,
            shouldSearch: false
          };
        }
        
        const bookingData = {
          customerEmail: userEmail,
          eventId: session.preferences.selectedEvent._id,
          attendees: session.preferences.attendees
        };
        
        try {
          const bookingResult = await processBooking(bookingData);
          if (bookingResult.success) {
            conversationSessions.delete(sessionId);
            return {
              reply: `🎉 **BOOKING CONFIRMED!** 🎉\n\nTicket Code: ${bookingResult.data.ticketCode}\nEvent: ${bookingResult.data.eventName}\nQuantity: ${session.preferences.quantity}\nTotal: ${session.preferences.selectedEvent.price * session.preferences.quantity} MAD\n\n📧 A QR code ticket has been sent to your email.\n\nThank you for booking with EVENTIX! 🎊\n\nType 'find events' to search again.`,
              shouldSearch: false
            };
          } else {
            return {
              reply: `❌ Booking failed: ${bookingResult.message}\n\nPlease try again or contact support.`,
              shouldSearch: false
            };
          }
        } catch (error) {
          return {
            reply: `❌ Error processing booking. Please try again later.`,
            shouldSearch: false
          };
        }
      } else if (parsed.isNo) {
        session.state = ConversationState.IDLE;
        session.preferences.selectedEvent = null;
        return {
          reply: `❌ Booking cancelled.\n\nWould you like to search for other events? (try 'find events')`,
          shouldSearch: false
        };
      }
      break;
  }
  
  if (parsed.category || parsed.city || parsed.maxPrice) {
    const query = buildMongoQuery({ category: parsed.category, city: parsed.city, maxPrice: parsed.maxPrice });
    const events = await Item.find(query).sort({ date: 1 }).limit(5).lean();
    
    session.lastSearchResults = events;
    session.preferences = {
      category: parsed.category,
      city: parsed.city,
      maxPrice: parsed.maxPrice,
      selectedEvent: null,
      quantity: null,
      attendees: []
    };
    
    if (events.length === 0) {
      return {
        reply: `😕 No events found${parsed.category ? ` for ${parsed.category}` : ''}${parsed.city ? ` in ${parsed.city}` : ''}${parsed.maxPrice ? ` under ${parsed.maxPrice} MAD` : ''}.\n\nTry:\n• 'concerts in Casablanca'\n• 'sport events under 200 MAD'\n• 'cinema in Rabat'`,
        shouldSearch: false
      };
    }
    
    session.state = ConversationState.SELECTING_EVENT;
    
    const eventsList = events.map((e, i) => 
      `${i+1}. 🎫 **${e.name}**\n   📍 ${e.city} | 💰 ${e.price} MAD\n   📅 ${new Date(e.date).toLocaleDateString()}\n   🎟️ ${e.availableSeats} seats left`
    ).join('\n\n');
    
    return {
      reply: `🎉 **Found ${events.length} events!** 🎉\n\n${eventsList}\n\nTo book tickets, type the event number (1-${events.length}).\n\nWhich event would you like to book?`,
      shouldSearch: false
    };
  }
  
  if (parsed.isBooking && session.lastSearchResults.length > 0) {
    session.state = ConversationState.SELECTING_EVENT;
    const eventsList = session.lastSearchResults.map((e, i) => 
      `${i+1}. ${e.name} - ${e.price} MAD - ${e.city}`
    ).join('\n');
    return {
      reply: `Which event would you like to book?\n\n${eventsList}\n\nPlease enter the number (1-${session.lastSearchResults.length}):`,
      shouldSearch: false
    };
  }
  
  const greetings = ['hi', 'hello', 'hey', 'bonjour', 'salut'];
  if (greetings.some(g => parsed.rawText.includes(g))) {
    return {
      reply: `👋 Hello! I'm your EVENTIX assistant.\n\nYou can:\n• Find events: "concerts in Casablanca"\n• Filter by price: "under 200 MAD"\n• Book tickets: search first, then say "book"\n\nWhat would you like to do?`,
      shouldSearch: false
    };
  }
  
  if (parsed.rawText.includes('help')) {
    return {
      reply: `🤖 **Help Center**\n\n**Find events:**\n• "music events in Casablanca"\n• "sport under 200 MAD"\n• "cinema in Rabat"\n\n**Book tickets:**\n1. Search for events\n2. Type event number\n3. Enter quantity\n4. Provide attendee info\n5. Confirm booking\n\n**Other:**\n• "clear" - reset conversation\n• "help" - show this menu\n\nWhat would you like to do?`,
      shouldSearch: false
    };
  }
  
  if (parsed.rawText.includes('clear')) {
    conversationSessions.delete(sessionId);
    return {
      reply: `🧹 Conversation cleared! How can I help you today?`,
      shouldSearch: false
    };
  }
  
  return {
    reply: `🤔 I'm not sure what you're looking for.\n\nTry:\n• 'find music events in Casablanca'\n• 'sport events under 200 MAD'\n• 'cinema in Rabat'\n\nOr type 'help' for more options.`,
    shouldSearch: false
  };
}

async function handleAttendeeCollection(message, parsed, session) {
  const current = session.currentAttendee;
  
  if (!current.fullName) {
    if (message.trim().length > 2) {
      current.fullName = message.trim();
      return {
        reply: `📧 Email address for ${current.fullName}:`,
        shouldSearch: false
      };
    }
    return {
      reply: `Please enter the full name for attendee ${session.currentAttendeeIndex}:`,
      shouldSearch: false
    };
  }
  
  if (!current.email) {
    if (/\S+@\S+\.\S+/.test(message)) {
      current.email = message.toLowerCase().trim();
      return {
        reply: `📱 Phone number for ${current.fullName}:`,
        shouldSearch: false
      };
    }
    return {
      reply: `Please enter a valid email address:`,
      shouldSearch: false
    };
  }
  
  if (!current.phone) {
    current.phone = message.trim();
    
    const nameParts = current.fullName.split(' ');
    session.preferences.attendees.push({
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || 'User',
      email: current.email,
      phone: current.phone
    });
    
    session.currentAttendeeIndex++;
    
    if (session.currentAttendeeIndex <= session.preferences.quantity) {
      session.currentAttendee = {};
      return {
        reply: `✅ Attendee ${session.currentAttendeeIndex - 1} added!\n\n📝 **Attendee ${session.currentAttendeeIndex} of ${session.preferences.quantity}**\n\nFull name (First and Last):`,
        shouldSearch: false
      };
    } else {
      session.state = ConversationState.CONFIRMING_BOOKING;
      const totalPrice = session.preferences.selectedEvent.price * session.preferences.quantity;
      const attendeesList = session.preferences.attendees.map((a, i) => 
        `${i+1}. ${a.firstName} ${a.lastName} (${a.email})`
      ).join('\n');
      
      return {
        reply: `📋 **BOOKING SUMMARY**\n\nEvent: ${session.preferences.selectedEvent.name}\nDate: ${new Date(session.preferences.selectedEvent.date).toLocaleDateString()}\nQuantity: ${session.preferences.quantity}\nTotal: ${totalPrice} MAD\n\n**Attendees:**\n${attendeesList}\n\n✅ Confirm booking? (yes/no)`,
        shouldSearch: false
      };
    }
  }
  
  return { reply: "I didn't understand. Let's try again.", shouldSearch: false };
}

async function processBooking(bookingData) {
  try {
    const { customerEmail, eventId, attendees } = bookingData;

    let customer = await Customer.findOne({ email: customerEmail.toLowerCase() });

    if (!customer) {
      customer = new Customer({
        firstName: attendees[0]?.firstName || "Guest",
        lastName: attendees[0]?.lastName || "User",
        email: customerEmail,
        phone: attendees[0]?.phone || "0000000000",
        acceptTerms: true
      });
      await customer.save();
    }

    const event = await Item.findById(eventId);
    if (!event) {
      return { success: false, message: 'Event not found' };
    }

    if (event.availableSeats < attendees.length) {
      return { success: false, message: 'Not enough seats available' };
    }

    const ticketCode = generateTicketCode();
    
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const booking = new Booking({
      contactPerson: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      },
      eventId: event._id,
      eventName: event.name,
      totalQuantity: attendees.length,
      totalPrice: event.price * attendees.length,
      ticketCode,
      attendees
    });

    await booking.save();

    event.availableSeats -= attendees.length;
    await event.save();

    customer.totalBookings += 1;
    await customer.save();

    const bookingDetails = {
      ticketCode,
      eventName: event.name,
      eventDate: eventDate,
      eventTime: event.time,
      venue: event.venue,
      city: event.city,
      quantity: attendees.length,
      totalPrice: event.price * attendees.length,
      customerName: `${customer.firstName} ${customer.lastName}`,
      attendees: attendees
    };

    const { qrCodeBuffer, ticketUrl } = await generateTicketQRCode(ticketCode, bookingDetails);
    
    const emailResult = await sendTicketEmail(customerEmail, bookingDetails, qrCodeBuffer, ticketUrl);
    
    if (!emailResult.success) {
      console.warn('⚠️ Email sending failed but booking was successful:', emailResult.error);
    }

    return {
      success: true,
      data: {
        ticketCode,
        eventName: event.name,
        emailSent: emailResult.success,
        ticketUrl: ticketUrl
      }
    };

  } catch (error) {
    console.error("Booking error:", error);
    return { success: false, message: error.message };
  }
}

// ================= CHAT ROUTE =================
app.post("/api/chat", async (req, res) => {
  const { message, sessionId, userEmail } = req.body;
  
  if (!message || message.trim() === "") {
    return res.json({ reply: "Please type something." });
  }
  
  try {
    console.log("📨 Received message:", message);
    
    const result = await handleConversation(message, sessionId || req.ip, userEmail);
    
    res.json({ reply: result?.reply || "⚠️ Something went wrong." });
    
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.json({ reply: "Sorry, I encountered an error. Please try again." });
  }
});

// ========== CUSTOMER ROUTES ==========
app.post('/api/customers/signin', async (req, res) => {
  try {
    let { firstName, lastName, email, phone, acceptTerms, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    email = email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, 10);

    const customer = await Customer.findOneAndUpdate(
      { email },
      {
        $set: {
          firstName,
          lastName,
          phone,
          acceptTerms: acceptTerms || false,
          lastLogin: new Date(),
          passwordHash
        },
        $setOnInsert: {
          signedInAt: new Date(),
          totalBookings: 0,
          isActive: true
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Welcome!',
      data: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      }
    });

  } catch (err) {
    console.error('Sign-in error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// ================= LOGIN ROUTE =================
// ================= LOGIN ROUTE (Updated to check organizers) =================
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();

    const organizer = await Organizer.findOne({ email: normalizedEmail });
    const customer = await Customer.findOne({ email: normalizedEmail });

    let user = null;
    let role = "user";
    let passwordHash = null;

    const isAdmin =
      (normalizedEmail === "naoufalfritel@gmail.com" ||
       normalizedEmail === "mariambakhbakh06@gmail.com") &&
      password === "admin123";

    if (organizer && organizer.status === "accepted") {
      user = organizer;
      role = "organizer";
      passwordHash = organizer.passwordHash;
    }

    else if (customer) {
      user = customer;
      passwordHash = customer.passwordHash;

      if (isAdmin) {
        role = "admin";
      }
    }

    else {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first."
      });
    }

    // password check only if NOT admin shortcut
    if (!isAdmin) {
      if (!passwordHash) {
        return res.status(500).json({
          success: false,
          message: "Password not set for this user"
        });
      }

      const isMatch = await bcrypt.compare(password, passwordHash);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }
    }

    let responseUser = {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role
    };

    if (role === "organizer") {
      responseUser.firstName = user.name.split(' ')[0];
      responseUser.lastName = user.name.split(' ').slice(1).join(' ') || "Organizer";
      responseUser.organizerData = {
        address: user.address,
        rooms: user.rooms,
        earnings: user.earnings,
        photo: user.photo,
        status: user.status
      };
    } else {
      responseUser.firstName = user.firstName;
      responseUser.lastName = user.lastName;
    }

    const token = jwt.sign(
      {
        id: user._id,
        role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: responseUser,
      role
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Login error",
      error: err.message
    });
  }
});
// ================= ME ROUTE =================
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await Customer.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: req.user.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// ========== BOOKING ROUTES ==========
app.post('/api/booking', async (req, res) => {
  try {
    const { customerEmail, eventId, attendees } = req.body;
    
    console.log("Booking request:", { customerEmail, eventId, attendeesCount: attendees?.length });
    
    if (!customerEmail) {
      return res.status(400).json({ success: false, message: 'Customer email required' });
    }
    
    let customer = await Customer.findOne({ email: customerEmail.toLowerCase() });
    
    if (!customer) {
      customer = new Customer({
        firstName: attendees[0]?.firstName || "Guest",
        lastName: attendees[0]?.lastName || "User",
        email: customerEmail,
        phone: attendees[0]?.phone || "0000000000",
        acceptTerms: true
      });
      await customer.save();
      console.log("✅ Auto-created customer:", customer.email);
    }
    
    const event = await Item.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    if (event.availableSeats < attendees.length) {
      return res.status(400).json({ success: false, message: 'Not enough seats available' });
    }
    
    const ticketCode = generateTicketCode();
    
    const booking = new Booking({
      contactPerson: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      },
      eventId: event._id,
      eventName: event.name,
      totalQuantity: attendees.length,
      totalPrice: event.price * attendees.length,
      ticketCode,
      attendees: attendees
    });
    
    await booking.save();
    
    event.availableSeats -= attendees.length;
    await event.save();
    
    customer.totalBookings += 1;
    await customer.save();
    
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const bookingDetails = {
      ticketCode,
      eventName: event.name,
      eventDate: eventDate,
      eventTime: event.time,
      venue: event.venue,
      city: event.city,
      quantity: attendees.length,
      totalPrice: event.price * attendees.length,
      customerName: `${customer.firstName} ${customer.lastName}`,
      attendees: attendees
    };
    
    const { qrCodeBuffer, ticketUrl } = await generateTicketQRCode(ticketCode, bookingDetails);
    await sendTicketEmail(customerEmail, bookingDetails, qrCodeBuffer, ticketUrl);
    
    res.status(201).json({
      success: true,
      message: 'Booking successful. QR code ticket sent to your email.',
      data: { ticketCode, eventName: event.name, eventDate: event.date, ticketUrl }
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// ========== EVENT ROUTES ==========
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ date: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/education', async (req, res) => {
  try {
    const items = await Item.find({ category: 'education' }).sort({ date: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== DASHBOARD ROUTE ==========
app.get('/api/dashboard', async (req, res) => {
  try {
    const now = new Date();

    const [
      totalSalesResult,
      totalParticipantsResult,
      totalReservations,
      activeEvents,
      totalEvents,
      recentBookings,
      salesByMonth,
      reservationStatus
    ] = await Promise.all([
      Booking.aggregate([
        { $match: { bookingStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Booking.aggregate([
        { $match: { bookingStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalQuantity' } } }
      ]),
      Booking.countDocuments({ bookingStatus: { $ne: 'cancelled' } }),
      Item.countDocuments({ date: { $gte: now }, availableSeats: { $gt: 0 } }),
      Item.countDocuments(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('contactPerson eventName bookingStatus totalQuantity totalPrice createdAt')
        .lean(),
      Booking.aggregate([
        { $match: { bookingStatus: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            ventes: { $sum: '$totalPrice' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Booking.aggregate([
        { $group: { _id: '$bookingStatus', value: { $sum: '$totalQuantity' } } }
      ])
    ]);

    const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
    const statusLabels = {
      pending: 'En attente',
      confirmed: 'Confirmees',
      cancelled: 'Annulees',
      completed: 'Terminees'
    };

    res.json({
      success: true,
      data: {
        stats: {
          totalSales: totalSalesResult[0]?.total || 0,
          participants: totalParticipantsResult[0]?.total || 0,
          reservations: totalReservations,
          activeEvents,
          totalEvents
        },
        salesData: salesByMonth.map((item) => ({
          month: monthNames[item._id.month - 1],
          ventes: item.ventes
        })),
        reservationData: reservationStatus.map((item) => ({
          name: statusLabels[item._id] || item._id,
          value: item.value
        })),
        recentReservations: recentBookings.map((booking) => ({
          id: booking._id,
          client: `${booking.contactPerson.firstName} ${booking.contactPerson.lastName}`,
          evenement: booking.eventName,
          statut: statusLabels[booking.bookingStatus] || booking.bookingStatus,
          quantity: booking.totalQuantity,
          totalPrice: booking.totalPrice
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Database: Billet_Database`);
  console.log(`📧 Email notifications: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured - add EMAIL_USER and EMAIL_PASSWORD to .env'}`);
  console.log(`👥 Organizer routes: ✅ Enabled`);
});
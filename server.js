import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/send-newsletter', async (req, res) => {
  try {
    const { subject, content, subscribers } = req.body;
    
    console.log('📧 Sending newsletter:', subject);
    console.log('👥 Recipients:', subscribers.length);

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
    }

    // Send emails via Resend API
    const emailPromises = subscribers.map(async (subscriber) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Blog Newsletter <noreply@joanamhone.com>',
          to: [subscriber.email],
          subject: subject,
          tags: [{ name: 'category', value: 'newsletter' }],
          tracking: {
            click: false,
            open: true
          },
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${subject}</h2>
              <div style="white-space: pre-wrap; line-height: 1.6;">${content}</div>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                You're receiving this because you subscribed to our newsletter.<br>
                <a href="${subscriber.unsubscribeUrl}" style="color: #666;">Unsubscribe here</a>
              </p>
            </div>
          `,
        }),
      });
      
      return response.ok;
    });

    const results = await Promise.all(emailPromises);
    const sent = results.filter(Boolean).length;

    res.json({ success: true, sent });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Newsletter server running on http://localhost:${PORT}`);
});
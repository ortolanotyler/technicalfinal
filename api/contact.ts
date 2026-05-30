import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';

// Native Vercel Serverless Function. Vercel parses the JSON body into req.body
// and routes POST /api/contact here automatically — no Express/app.listen.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, company, message } = req.body ?? {};

  if (!email || !name) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  // A valid SendGrid key starts with "SG."; treat anything else (unset, or a
  // dev placeholder like "a") as "no key" so we log instead of 401-ing.
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.log('[Dev] Contact form submission:', { name, email, company, message });
    return res.status(200).json({ success: true, message: 'Dev mode: Email logged to console' });
  }
  sgMail.setApiKey(apiKey);

  const msg = {
    to: 'recruit@certusgroup.com',
    from: 'tyler@certusgroup.com',
    subject: `New Contact: ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\nMessage: ${message || 'N/A'}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Message:</strong> ${message || 'N/A'}</p>
    `,
  };

  try {
    await sgMail.send(msg);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

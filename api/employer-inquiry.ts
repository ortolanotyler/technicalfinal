import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';

// Native Vercel Serverless Function for employer (client) inquiries — the
// "hire talent" intake form. Notifies the team and confirms to the employer.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    company, name, email, phone, role, location, hires, timeline, message,
  } = req.body ?? {};

  if (!company || !name || !email) {
    return res.status(400).json({ error: 'Company, name and email are required' });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.log('[Dev] Employer inquiry:', { company, name, email, role });
    return res.status(200).json({ success: true, message: 'Dev mode: Inquiry logged to console' });
  }
  sgMail.setApiKey(apiKey);

  const fields: [string, unknown][] = [
    ['Company', company],
    ['Contact', name],
    ['Email', email],
    ['Phone', phone || 'Not provided'],
    ['Role(s) to fill', role || 'Not specified'],
    ['Location', location || 'Not specified'],
    ['Number of hires', hires || 'Not specified'],
    ['Timeline', timeline || 'Not specified'],
    ['Message', message || '—'],
  ];

  try {
    await sgMail.send({
      to: 'recruit@certusgroup.com',
      from: { email: 'tyler@certusgroup.com', name: 'Certus Technical Search' },
      replyTo: email,
      subject: `New Employer Inquiry: ${company}${role ? ` — ${role}` : ''}`,
      text: fields.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html:
        `<h3>New Employer Inquiry</h3>` +
        fields.map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`).join(''),
    });
  } catch (error) {
    console.error('Error sending employer inquiry:', error);
    return res.status(500).json({ error: 'Failed to send inquiry' });
  }

  // Confirmation to the employer (best-effort).
  try {
    await sgMail.send({
      to: email,
      from: { email: 'tyler@certusgroup.com', name: 'Certus Technical Search' },
      replyTo: 'recruit@certusgroup.com',
      subject: 'Thanks for reaching out — Certus Technical Search',
      text:
        `Hi ${name},\n\n` +
        `Thanks for contacting Certus Technical Search about your hiring needs${role ? ` (${role})` : ''}. ` +
        `One of our specialists will review your request and reach out shortly to discuss how we can help.\n\n` +
        `— The Certus Technical Search Team\nhttps://thecertusgroup.tech`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">` +
        `<p>Hi ${name},</p>` +
        `<p>Thanks for contacting <strong>Certus Technical Search</strong> about your hiring needs${role ? ` (${role})` : ''}. ` +
        `One of our specialists will review your request and reach out shortly to discuss how we can help.</p>` +
        `<p style="color:#555">— The Certus Technical Search Team</p>` +
        `</div>`,
    });
  } catch (error) {
    console.error('Employer confirmation email failed (non-fatal):', error);
  }

  return res.status(200).json({ success: true });
}

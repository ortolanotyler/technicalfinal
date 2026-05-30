import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// Native Vercel Serverless Function. Vercel parses the JSON body into req.body
// and routes POST /api/apply here automatically — no Express/app.listen.
// Note: Vercel caps request bodies at 4.5MB, so very large base64 resumes are
// rejected by the platform (413) before reaching here.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName, lastName, email, phone, linkedin,
    jobTitle, jobRef, resumeBase64, resumeName,
  } = req.body ?? {};

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.log('[Dev] Job application:', { firstName, lastName, email, jobTitle });
    return res.status(200).json({ success: true, message: 'Dev mode: Application logged to console' });
  }
  sgMail.setApiKey(apiKey);

  const msg: any = {
    to: 'recruit@certusgroup.com',
    from: 'tyler@certusgroup.com',
    subject: `New Job Application: ${jobTitle} (${jobRef || 'No Ref'})`,
    text: `
      New application for ${jobTitle} (${jobRef || 'No Ref'})

      Name: ${firstName} ${lastName}
      Email: ${email}
      Phone: ${phone || 'Not provided'}
      LinkedIn: ${linkedin || 'Not provided'}
    `,
    html: `
      <h3>New Job Application</h3>
      <p><strong>Job:</strong> ${jobTitle} (${jobRef || 'No Ref'})</p>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>LinkedIn:</strong> ${linkedin || 'Not provided'}</p>
    `,
  };

  if (resumeBase64) {
    const ext = (resumeName || '').split('.').pop()?.toLowerCase();
    msg.attachments = [
      {
        content: resumeBase64.split(',')[1],
        filename: resumeName || 'resume.pdf',
        type: (ext && MIME_BY_EXT[ext]) || 'application/octet-stream',
        disposition: 'attachment',
      },
    ];
  }

  try {
    await sgMail.send(msg);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending application email:', error);
    return res.status(500).json({ error: 'Failed to send application' });
  }
}

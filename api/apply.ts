import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';
import { head } from '@vercel/blob';

const MIME_BY_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

// Native Vercel Serverless Function. Vercel parses the JSON body into req.body
// and routes POST /api/apply here automatically — no Express/app.listen.
// The resume is uploaded by the browser directly to (private) Vercel Blob; the
// client sends us its blob URL, which we read with our token and attach to the
// application email.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    firstName, lastName, email, phone, linkedin,
    jobTitle, jobRef, resumeUrl, resumeName,
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

  if (resumeUrl) {
    try {
      // Private blob: read its bytes by fetching the downloadUrl WITH the
      // read-write token as a Bearer header (an unauthorized fetch 403s).
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      const meta = await head(resumeUrl, { token });
      const fileRes = await fetch(meta.downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!fileRes.ok) throw new Error(`blob fetch ${fileRes.status}`);
      const buf = Buffer.from(await fileRes.arrayBuffer());
      const ext = (resumeName || meta.pathname || '').split('.').pop()?.toLowerCase();
      msg.attachments = [
        {
          content: buf.toString('base64'),
          filename: resumeName || meta.pathname?.split('/').pop() || 'resume.pdf',
          type: (ext && MIME_BY_EXT[ext]) || meta.contentType || 'application/octet-stream',
          disposition: 'attachment',
        },
      ];
    } catch (err) {
      // Don't fail the whole application if the attachment can't be read —
      // send it anyway and flag the blob so it can be retrieved manually.
      console.error('Failed to attach resume from blob:', err);
      msg.html += `<p><strong>Resume:</strong> upload received but could not be attached. Blob: ${resumeUrl}</p>`;
      msg.text += `\n      Resume: upload received but could not be attached. Blob: ${resumeUrl}`;
    }
  }

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending application email:', error);
    return res.status(500).json({ error: 'Failed to send application' });
  }

  // Send the applicant a confirmation. Best-effort: a failure here must not
  // fail the application (the recruiter email already went through).
  try {
    const roleLine = jobTitle ? ` for the <strong>${jobTitle}</strong> role` : '';
    const roleText = jobTitle ? ` for the ${jobTitle} role` : '';
    await sgMail.send({
      to: email,
      from: { email: 'tyler@certusgroup.com', name: 'Certus Technical Search' },
      replyTo: 'recruit@certusgroup.com',
      subject: `We received your application${jobTitle ? ` for ${jobTitle}` : ''}`,
      text:
        `Hi ${firstName},\n\n` +
        `Thanks for applying${roleText} with Certus Technical Search. ` +
        `We have your application and our team will review it. If your background is a strong match, a recruiter will be in touch.\n\n` +
        `You can see our current openings at https://thecertusgroup.tech/jobs\n\n` +
        `Thanks,\nThe Certus Technical Search Team`,
      html:
        `<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6">` +
        `<p>Hi ${firstName},</p>` +
        `<p>Thanks for applying${roleLine} with <strong>Certus Technical Search</strong>. ` +
        `We have your application and our team will review it. If your background is a strong match, a recruiter will be in touch.</p>` +
        `<p>You can see our current openings ` +
        `<a href="https://thecertusgroup.tech/jobs">here</a>.</p>` +
        `<p style="color:#555">Thanks,<br/>The Certus Technical Search Team</p>` +
        `</div>`,
    });
  } catch (error) {
    console.error('Applicant confirmation email failed (non-fatal):', error);
  }

  return res.status(200).json({ success: true });
}

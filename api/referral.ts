import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';

// Shop-owner referral program (/referrals). Every field is optional by design:
// a blank submission still emails the team, so nothing ever blocks a referral.
function clean(v: unknown, max = 2000): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const b = req.body ?? {};
  const candidateName = clean(b.candidateName, 200);
  const candidatePhone = clean(b.candidatePhone, 100);
  const candidateTrade = clean(b.candidateTrade, 200);
  const referrerName = clean(b.referrerName, 200);
  const shopName = clean(b.shopName, 200);
  const referrerContact = clean(b.referrerContact, 200);
  const note = clean(b.note);

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.log('[Dev] Referral:', { candidateName, candidatePhone, shopName });
    return res.status(200).json({ success: true, message: 'Dev mode: Referral logged to console' });
  }
  sgMail.setApiKey(apiKey);

  const dash = (v: string) => v || '-';
  const fields: [string, string][] = [
    ['Candidate', dash(candidateName)],
    ['Candidate phone', dash(candidatePhone)],
    ['What they do', dash(candidateTrade)],
    ['Referred by', dash(referrerName)],
    ['Shop', dash(shopName)],
    ['Referrer phone/email', dash(referrerContact)],
    ['Note', dash(note)],
  ];

  const who = candidateName || candidatePhone || 'unnamed candidate';
  const from = shopName || referrerName;
  const replyTo = /\S+@\S+\.\S+/.test(referrerContact) ? referrerContact : undefined;

  try {
    await sgMail.send({
      to: 'recruit@certusgroup.com',
      from: { email: 'tyler@certusgroup.com', name: 'Certus Technical Search' },
      ...(replyTo ? { replyTo } : {}),
      subject: `New Shop Referral: ${who}${from ? ` (from ${from})` : ''}`,
      text: 'New referral from technical.certusgroup.com/referrals\n\n' + fields.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html:
        `<h3>New Shop Referral</h3>` +
        fields.map(([k, v]) => `<p><strong>${k}:</strong> ${esc(v).replace(/\n/g, '<br/>')}</p>`).join('') +
        `<p style="color:#777;font-size:12px">Submitted at technical.certusgroup.com/referrals</p>`,
    });
  } catch (error) {
    console.error('Error sending referral:', error);
    return res.status(500).json({ error: 'Failed to send referral' });
  }

  return res.status(200).json({ success: true });
}

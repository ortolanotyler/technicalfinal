import type { VercelRequest, VercelResponse } from '@vercel/node';
import sgMail from '@sendgrid/mail';
import { randomInt } from 'crypto';

// Shop-owner referral program (/referrals). Every field is optional by design:
// a blank submission still emails the team, so nothing ever blocks a referral.
// Each referral gets a number (TR-XXXXXX) that goes in the team email subject
// (search recruit@ by it) and in the thank-you email to the referrer.
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

// No 0/O/1/I/L so the number reads cleanly over the phone.
const ID_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
function newReferralId(): string {
  let id = '';
  for (let i = 0; i < 6; i++) id += ID_CHARS[randomInt(ID_CHARS.length)];
  return `TR-${id}`;
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

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
  // referrerContact = the old single "phone or email" field (cached pages).
  const legacyContact = clean(b.referrerContact, 200);
  let referrerEmail = clean(b.referrerEmail, 200);
  let referrerPhone = clean(b.referrerPhone, 100);
  if (legacyContact) {
    if (!referrerEmail && isEmail(legacyContact)) referrerEmail = legacyContact;
    else if (!referrerPhone) referrerPhone = legacyContact;
  }
  const note = clean(b.note);
  const referralId = newReferralId();

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.log('[Dev] Referral:', { referralId, candidateName, candidatePhone, shopName, referrerEmail });
    return res.status(200).json({ success: true, referralId, message: 'Dev mode: Referral logged to console' });
  }
  sgMail.setApiKey(apiKey);

  const dash = (v: string) => v || '-';
  const fields: [string, string][] = [
    ['Referral #', referralId],
    ['Candidate', dash(candidateName)],
    ['Candidate phone', dash(candidatePhone)],
    ['What they do', dash(candidateTrade)],
    ['Referred by', dash(referrerName)],
    ['Shop', dash(shopName)],
    ['Referrer email', dash(referrerEmail)],
    ['Referrer phone', dash(referrerPhone)],
    ['Note', dash(note)],
  ];

  const who = candidateName || candidatePhone || 'unnamed candidate';
  const from = shopName || referrerName;
  const validReferrerEmail = isEmail(referrerEmail) ? referrerEmail : '';

  try {
    await sgMail.send({
      to: 'recruit@certusgroup.com',
      from: { email: 'tyler@certusgroup.com', name: 'Certus Technical Search' },
      ...(validReferrerEmail ? { replyTo: validReferrerEmail } : {}),
      subject: `New Shop Referral ${referralId}: ${who}${from ? ` (from ${from})` : ''}`,
      text: 'New referral from technical.certusgroup.com/referrals\n\n' + fields.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html:
        `<h3>New Shop Referral ${referralId}</h3>` +
        fields.map(([k, v]) => `<p><strong>${k}:</strong> ${esc(v).replace(/\n/g, '<br/>')}</p>`).join('') +
        `<p style="color:#777;font-size:12px">Submitted at technical.certusgroup.com/referrals. ` +
        (validReferrerEmail
          ? `A thank-you email with this referral number went to ${esc(validReferrerEmail)}.`
          : `No referrer email, so no thank-you email was sent.`) +
        `</p>`,
    });
  } catch (error) {
    console.error('Error sending referral:', error);
    return res.status(500).json({ error: 'Failed to send referral' });
  }

  // Thank-you to the shop owner (best-effort; the referral is already in).
  if (validReferrerEmail) {
    const hi = referrerName ? referrerName.split(/\s+/)[0] : 'there';
    const them = candidateName || 'the candidate';
    try {
      await sgMail.send({
        to: validReferrerEmail,
        from: { email: 'tyler@certusgroup.com', name: 'Certus Technical Search' },
        replyTo: 'recruit@certusgroup.com',
        subject: `Thank you for your referral (#${referralId})`,
        text:
          `Hi ${hi},\n\n` +
          `Thank you for referring ${them} to Certus Technical Search. Your referral number is ${referralId}.\n\n` +
          `We will reach out to ${candidateName ? candidateName.split(/\s+/)[0] : 'them'} and work on finding the right fit. ` +
          `If we place ${candidateName ? 'them' : 'this candidate'}, we will email you to let you know.\n\n` +
          `If you have any questions, just reply to this email with your referral number.\n\n` +
          `Thank you,\nThe Certus Technical Search Team\n(1 855) 323 7887\nhttps://technical.certusgroup.com`,
        html:
          `<div style="font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;line-height:1.6;max-width:560px">` +
          `<p>Hi ${esc(hi)},</p>` +
          `<p>Thank you for referring ${esc(them)} to <strong>Certus Technical Search</strong>. ` +
          `Your referral number is <strong>${referralId}</strong>.</p>` +
          `<p>We will reach out to ${esc(candidateName ? candidateName.split(/\s+/)[0] : 'them')} and work on finding the right fit. ` +
          `If we place ${candidateName ? 'them' : 'this candidate'}, we will email you to let you know.</p>` +
          `<p>If you have any questions, just reply to this email with your referral number.</p>` +
          `<p style="color:#555">Thank you,<br/>The Certus Technical Search Team<br/>(1 855) 323 7887<br/>` +
          `<a href="https://technical.certusgroup.com" style="color:#555">technical.certusgroup.com</a></p>` +
          `</div>`,
      });
    } catch (error) {
      console.error('Referral thank-you email failed (non-fatal):', error);
    }
  }

  return res.status(200).json({ success: true, referralId });
}

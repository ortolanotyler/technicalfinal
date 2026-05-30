import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Issues short-lived client upload tokens so the browser can upload a resume
// directly to Vercel Blob (bypassing the 4.5MB function body limit). The store
// is private, so the uploaded file is only readable with our token — the
// /api/apply function uses it to attach the resume to the application email.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await handleUpload({
      body: req.body as HandleUploadBody,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        maximumSizeInBytes: 8 * 1024 * 1024, // 8MB
        addRandomSuffix: true,
      }),
      // No onUploadCompleted: we read the blob and attach it at submit time
      // (in /api/apply), so we don't need an upload-completed callback.
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
}

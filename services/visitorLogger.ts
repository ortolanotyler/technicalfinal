export const logVisitor = async (info: { ip?: string, location?: string, userAgent?: string }) => {
  try {
    await fetch('/api/visitor-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
  } catch (error) {
    console.error('Error sending visitor notification:', error);
  }
};

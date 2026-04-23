export const logVisitor = async (info: { ip?: string, location?: string, userAgent?: string }) => {
  try {
    // Get public IP
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    
    const extraInfo = {
      ...info,
      ip: ipData.ip,
      language: navigator.language,
      referrer: document.referrer,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      time: new Date().toLocaleString()
    };

    await fetch('/api/visitor-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extraInfo),
    });
  } catch (error) {
    console.error('Error sending visitor notification:', error);
  }
};

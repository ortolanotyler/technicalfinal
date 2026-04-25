export const logVisitor = async (info: { ip?: string, location?: string, userAgent?: string }) => {
  try {
    console.log('[visitorLogger] Attempting to log visitor...');

    // Get public IP
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    if (!ipResponse.ok) throw new Error(`Failed to fetch IP: ${ipResponse.statusText}`);
    const ipData = await ipResponse.json();
    console.log('[visitorLogger] IP fetched successfully');
    
    const extraInfo = {
      ...info,
      ip: ipData.ip,
      language: navigator.language,
      referrer: document.referrer,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      time: new Date().toLocaleString()
    };

    const response = await fetch('/api/visitor-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extraInfo),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to log visitor (backend): ${response.status} ${errText}`);
    }
    
    console.log('[visitorLogger] Visitor logged successfully');
  } catch (error) {
    console.error('[visitorLogger] Error sending visitor notification:', error);
  }
};

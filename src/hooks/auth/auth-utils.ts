
// Helper function to check for temporary email domains
export const isTemporaryEmail = (email: string): boolean => {
  const tempEmailDomains = [
    'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
    'disposablemail.com', '10minutemail.com', 'throwawaymail.com', 'yopmail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return tempEmailDomains.includes(domain);
};

// Get client's IP address
export const fetchClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching IP:', error);
    return 'unknown';
  }
};

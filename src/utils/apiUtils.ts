
/**
 * Extracts the content from HTML response
 */
export const extractFromHtml = (html: string, selector = 'body'): string => {
  try {
    // Simple regex-based extraction for basic cases
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return bodyMatch ? bodyMatch[1] : html;
  } catch (error) {
    return html;
  }
};

/**
 * Checks if the response is HTML
 */
export const isHtmlResponse = (response: string): boolean => {
  return response.trim().startsWith('<!DOCTYPE html>') || 
         response.trim().startsWith('<html') || 
         response.includes('<body') || 
         response.includes('<head');
};

export const fetchActiveApiConfig = async () => {
  try {
    // This would typically fetch from your API/database
    // Mocked for now
    return {
      user_token: "default_user_token",
      kiosk_token: "default_kiosk_token"
    };
  } catch (error) {
    console.error("Error fetching API config:", error);
    throw error;
  }
};


// Define the available proxy types
export type ProxyType = "allorigins" | "corsproxy" | "corsanywhere" | "direct" | "yproxy";

// Define the proxy configuration interface
export interface ProxyConfig {
  proxyType: ProxyType;
  customUrl?: string;
}

// Function to build a proxy URL based on the target URL and proxy configuration
export function buildProxyUrl(targetUrl: string, config: ProxyConfig): string {
  const encodedUrl = encodeURIComponent(targetUrl);
  
  switch (config.proxyType) {
    case "allorigins":
      return `https://api.allorigins.win/get?url=${encodedUrl}`;
    
    case "corsproxy":
      return `https://corsproxy.io/?${encodedUrl}`;
    
    case "corsanywhere":
      return `https://cors-anywhere.herokuapp.com/${targetUrl}`;
    
    case "yproxy":
      return `https://yacdn.org/proxy/${targetUrl}`;
      
    case "direct":
      return targetUrl;
    
    default:
      if (config.customUrl) {
        return config.customUrl.replace('{{url}}', encodedUrl);
      }
      // Default to allorigins if no type or custom URL is specified
      return `https://api.allorigins.win/get?url=${encodedUrl}`;
  }
}

// Fetch data using the specified proxy configuration
export async function fetchViaProxy(url: string, config: ProxyConfig) {
  try {
    const proxyUrl = buildProxyUrl(url, config);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Proxy request failed with status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      data = await response.json();
      
      // Handle AllOrigins specific format
      if (config.proxyType === 'allorigins' && data.contents) {
        try {
          // AllOrigins wraps the actual response in a 'contents' field
          // which can be a JSON string or HTML content
          return JSON.parse(data.contents);
        } catch (e) {
          // If parsing fails, return the raw contents
          return { error: 'Failed to parse response contents', raw: data.contents };
        }
      }
      
      return data;
    } else {
      // Handle non-JSON response
      const textResponse = await response.text();
      
      // Try to see if the text is actually JSON
      try {
        return JSON.parse(textResponse);
      } catch (e) {
        // If parsing fails, return as error
        return { 
          error: 'Response is not valid JSON', 
          raw: textResponse.substring(0, 500) // Limit the length
        };
      }
    }
  } catch (error) {
    console.error('Error fetching via proxy:', error);
    return {
      error: `Proxy error: ${(error as Error).message}`,
      success: 'false'
    };
  }
}

// Fetch proxy settings from the database
export async function fetchProxySettings(): Promise<ProxyConfig> {
  try {
    const { data: supabaseData } = await fetch('/api/proxy-settings');
    if (supabaseData) {
      return {
        proxyType: supabaseData.proxy_type as ProxyType || 'allorigins',
        customUrl: supabaseData.custom_url
      };
    }
  } catch (error) {
    console.error('Error fetching proxy settings:', error);
  }
  
  // Default settings if fetching fails
  return {
    proxyType: 'allorigins'
  };
}

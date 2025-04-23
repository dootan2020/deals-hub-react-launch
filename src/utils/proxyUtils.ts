
export type ProxyType = 'allorigins' | 'corsproxy' | 'corsanywhere' | 'direct';

export interface ProxyConfig {
  proxy_type: ProxyType | string;
  custom_url?: string;
  type?: ProxyType | string; // Added for compatibility with existing code
}

export const buildProxyUrl = (originalUrl: string, config: ProxyConfig): { url: string, isProxied: boolean } => {
  const proxyType = config.type || config.proxy_type;
  
  switch (proxyType) {
    case 'allorigins':
      return {
        url: `https://api.allorigins.win/get?url=${encodeURIComponent(originalUrl)}`,
        isProxied: true
      };
    case 'corsproxy':
      return {
        url: `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`,
        isProxied: true
      };
    case 'corsanywhere':
      return {
        url: `https://cors-anywhere.herokuapp.com/${originalUrl}`,
        isProxied: true
      };
    case 'direct':
    default:
      return {
        url: originalUrl,
        isProxied: false
      };
  }
};

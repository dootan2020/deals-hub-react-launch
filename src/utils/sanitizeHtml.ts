
/**
 * Simple HTML sanitizer to prevent XSS attacks
 * For more complex needs, consider using a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // List of allowed HTML tags
  const allowedTags = [
    'p', 'br', 'b', 'i', 'u', 'strong', 'em', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'span'
  ];
  
  // Create regex pattern to match disallowed tags
  const disallowedTagsPattern = new RegExp(
    `<(?!\\/?(${allowedTags.join('|')})\\s*\\/?)[^>]+>`, 
    'gi'
  );
  
  // Remove disallowed tags
  let sanitized = html.replace(disallowedTagsPattern, '');
  
  // Sanitize attributes to only allow href, style, class
  sanitized = sanitized.replace(
    /<([a-z][a-z0-9]*)\s+([^>]*?)>/gi,
    (match, tag, attributes) => {
      // Extract allowed attributes
      const allowedAttributes = 
        attributes.match(/(?:href|style|class|rel)="[^"]*"/gi) || [];
      
      // For <a> tags, ensure we have rel="noopener noreferrer" for security
      if (tag.toLowerCase() === 'a' && allowedAttributes.some(attr => attr.startsWith('href='))) {
        if (!allowedAttributes.some(attr => attr.startsWith('rel='))) {
          allowedAttributes.push('rel="noopener noreferrer"');
        }
      }
      
      return `<${tag} ${allowedAttributes.join(' ')}>`;
    }
  );
  
  return sanitized;
}

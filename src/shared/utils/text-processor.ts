/**
 * Processes text content to handle line breaks properly
 * Converts \r\n and \n line breaks to HTML <br> tags
 */
export const processTextWithLineBreaks = (text: string): string => {
  if (!text) return text;
  
  // Replace \r\n (Windows line breaks) and \n (Unix line breaks) with <br> tags
  return text
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>');
};

/**
 * Processes HTML content to handle line breaks in text nodes
 * This function preserves existing HTML structure while converting line breaks in plain text
 */
export const processHtmlWithLineBreaks = (htmlString: string): string => {
  if (!htmlString) return htmlString;
  
  // If the content is already HTML (contains HTML tags), process it differently
  if (htmlString.includes('<')) {
    // For HTML content, we need to be more careful to only replace line breaks in text nodes
    // This regex finds text content between HTML tags and processes line breaks there
    return htmlString.replace(/>([^<]*?)</g, (match, textContent) => {
      if (textContent.trim()) {
        const processedText = processTextWithLineBreaks(textContent);
        return `>${processedText}<`;
      }
      return match;
    });
  } else {
    // For plain text, simply process line breaks
    return processTextWithLineBreaks(htmlString);
  }
};


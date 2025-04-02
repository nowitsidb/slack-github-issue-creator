/**
 * Slack message processing service
 * Handles parsing Slack threads into GitHub issue format
 */

/**
 * Parse a Slack thread into GitHub issue format
 * @param {Array} messages - Array of Slack messages from a thread
 * @returns {Object} Formatted issue object with title and body
 */
function parseThreadToIssue(messages) {
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided to parse');
    }
  
    // Use the first message as the title (limit to 100 chars to avoid overly long titles)
    const title = formatSlackMessageForTitle(messages[0].text);
    
    // Format all messages into the body
    let body = "## Issue created from Slack thread\n\n";
    
    // Get the timestamp from the first message to include in the issue
    const threadStartTime = new Date(parseInt(messages[0].ts.split('.')[0]) * 1000)
      .toISOString()
      .replace('T', ' ')
      .substr(0, 19);
    
    body += `**Thread started:** ${threadStartTime}\n\n`;
    
    // Process each message in the thread
    messages.forEach((message, index) => {
      // Get user info if available
      const username = message.username || message.user || `User ${index + 1}`;
      
      // Get message timestamp
      const timestamp = new Date(parseInt(message.ts.split('.')[0]) * 1000)
        .toISOString()
        .replace('T', ' ')
        .substr(0, 19);
      
      // Format message with timestamp
      body += `### ${username} (${timestamp}):\n${formatSlackMessageForBody(message.text)}\n\n`;
      
      // Include any attachments or files as links
      if (message.files && message.files.length > 0) {
        body += "**Attachments:**\n";
        message.files.forEach(file => {
          body += `- [${file.name}](${file.permalink})\n`;
        });
        body += "\n";
      }
    });
    
    // Add a note at the end
    body += "\n---\n*This issue was automatically generated from a Slack thread.*";
    
    return { title, body };
  }
  
  /**
   * Format Slack message text for use as a GitHub issue title
   * @param {string} text - Raw Slack message text
   * @returns {string} Formatted text for issue title
   */
  function formatSlackMessageForTitle(text) {
    if (!text) return "New issue from Slack thread";
    
    // Remove Slack-specific formatting and limit to 100 chars
    return text
      .replace(/<@[A-Z0-9]+>/g, '') // Remove user mentions
      .replace(/<#[A-Z0-9]+\|([^>]+)>/g, '#$1') // Convert channel mentions
      .replace(/<(https?:[^|>]+)\|([^>]+)>/g, '$2') // Convert links with labels
      .replace(/<(https?:[^>]+)>/g, '$1') // Convert plain links
      .substring(0, 100)
      .trim();
  }
  
  /**
   * Format Slack message text for use in GitHub issue body
   * @param {string} text - Raw Slack message text
   * @returns {string} Formatted text for issue body
   */
  function formatSlackMessageForBody(text) {
    if (!text) return "_No message content_";
    
    return text
      // Convert user mentions to a readable format
      .replace(/<@([A-Z0-9]+)>/g, '@user') 
      
      // Convert channel mentions
      .replace(/<#([A-Z0-9]+)\|([^>]+)>/g, '#$2')
      
      // Convert links with custom text
      .replace(/<(https?:[^|>]+)\|([^>]+)>/g, '[$2]($1)')
      
      // Convert plain links
      .replace(/<(https?:[^>]+)>/g, '$1')
      
      // Convert code blocks
      .replace(/```([^`]+)```/g, '```\n$1\n```')
      
      // Convert inline code
      .replace(/`([^`]+)`/g, '`$1`')
      
      // Convert bold text
      .replace(/\*([^*]+)\*/g, '**$1**')
      
      // Convert italic text
      .replace(/_([^_]+)_/g, '*$1*');
  }
  
  module.exports = {
    parseThreadToIssue,
    formatSlackMessageForTitle,
    formatSlackMessageForBody
  };
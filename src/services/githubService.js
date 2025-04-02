/**
 * GitHub API service
 * Handles interaction with GitHub API for issue creation
 */
const { Octokit } = require('@octokit/rest');

// Initialize GitHub API client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Get repository information from environment variables
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

// Get optional issue labels from environment
const DEFAULT_LABELS = ['slack-thread', 'automated'];
const ISSUE_LABELS = process.env.ISSUE_LABELS 
  ? process.env.ISSUE_LABELS.split(',') 
  : DEFAULT_LABELS;

/**
 * Create a GitHub issue from formatted data
 * @param {Object} issueData - Object containing issue title and body
 * @param {string} issueData.title - The title for the GitHub issue
 * @param {string} issueData.body - The body content for the GitHub issue
 * @param {Array} [issueData.labels] - Optional array of labels to apply
 * @returns {Promise} GitHub API response
 */
async function createIssue({ title, body, labels = ISSUE_LABELS }) {
  if (!GITHUB_OWNER || !GITHUB_REPO) {
    throw new Error('GitHub repository information missing. Check GITHUB_OWNER and GITHUB_REPO environment variables.');
  }

  try {
    // Create the issue via GitHub API
    const response = await octokit.issues.create({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      title,
      body,
      labels
    });
    
    return response;
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    
    // Enhance error message for common issues
    if (error.status === 404) {
      throw new Error(`Repository ${GITHUB_OWNER}/${GITHUB_REPO} not found or access denied. Check your token permissions.`);
    } else if (error.status === 401) {
      throw new Error('GitHub authentication failed. Check your GITHUB_TOKEN.');
    } else {
      throw new Error(`GitHub API error: ${error.message}`);
    }
  }
}

/**
 * Check if a GitHub repository is accessible
 * Useful for validating credentials and permissions
 * @returns {Promise<boolean>} True if repository is accessible
 */
async function checkRepositoryAccess() {
  try {
    await octokit.repos.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO
    });
    return true;
  } catch (error) {
    console.error('Repository access check failed:', error.message);
    return false;
  }
}

module.exports = {
  createIssue,
  checkRepositoryAccess
};
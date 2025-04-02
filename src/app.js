// Main application logic
const express = require('express');
const bodyParser = require('body-parser');
const { App } = require('@slack/bolt');

// Import services
const slackService = require('./services/slackService');
const githubService = require('./services/githubService');

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Check for required environment variables
if (!process.env.SLACK_SIGNING_SECRET) {
  console.error('\n❌ ERROR: SLACK_SIGNING_SECRET environment variable is missing!');
  console.error('❌ Please set up your .env file by copying .env.example and adding your credentials.');
  console.error('❌ You can find your Slack Signing Secret in your Slack App Settings under "Basic Information".\n');
  process.exit(1);
}

if (!process.env.SLACK_BOT_TOKEN) {
  console.error('\n❌ ERROR: SLACK_BOT_TOKEN environment variable is missing!');
  console.error('❌ Please set up your .env file by copying .env.example and adding your credentials.');
  console.error('❌ You can find your Bot Token in your Slack App Settings under "OAuth & Permissions".\n');
  process.exit(1);
}

// Initialize Slack app
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send({
    status: 'ok',
    message: 'Slack to GitHub Issue Creator is running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Command to create a GitHub issue from a thread
slackApp.command('/create-issue', async ({ command, ack, respond }) => {
  await ack();
  
  try {
    // Get thread ID - either the thread_ts or the ts if it's the first message
    const threadTs = command.thread_ts || command.ts;
    
    // If not in a thread, inform the user
    if (!threadTs) {
      await respond("This command must be used within a thread.");
      return;
    }
    
    // Fetch all messages in the thread
    const result = await slackApp.client.conversations.replies({
      channel: command.channel_id,
      ts: threadTs
    });
    
    if (!result.messages || result.messages.length === 0) {
      await respond("Couldn't find any messages in this thread.");
      return;
    }
    
    // Parse the thread into a GitHub issue
    const issue = slackService.parseThreadToIssue(result.messages);
    
    // Create GitHub issue
    const githubResponse = await githubService.createIssue(issue);
    
    // Respond with the link to the created issue
    await respond(`Issue created successfully: ${githubResponse.data.html_url}`);
    
  } catch (error) {
    console.error('Error in /create-issue command:', error);
    await respond(`Error creating issue: ${error.message}`);
  }
});

// Function to automatically listen for a trigger phrase in threads
slackApp.event('message', async ({ event, client }) => {
  // Only process thread messages with the trigger
  if (event.thread_ts && event.text && event.text.includes('#create-issue')) {
    try {
      // Fetch all messages in the thread
      const result = await client.conversations.replies({
        channel: event.channel,
        ts: event.thread_ts
      });
      
      if (!result.messages || result.messages.length === 0) {
        await client.chat.postMessage({
          channel: event.channel,
          thread_ts: event.thread_ts,
          text: "Couldn't find any messages in this thread."
        });
        return;
      }
      
      // Parse the thread into a GitHub issue
      const issue = slackService.parseThreadToIssue(result.messages);
      
      // Create GitHub issue
      const githubResponse = await githubService.createIssue(issue);
      
      // Respond with the link to the created issue
      await client.chat.postMessage({
        channel: event.channel,
        thread_ts: event.thread_ts,
        text: `Issue created successfully: ${githubResponse.data.html_url}`
      });
      
    } catch (error) {
      console.error('Error in message event handler:', error);
      await client.chat.postMessage({
        channel: event.channel,
        thread_ts: event.thread_ts,
        text: `Error creating issue: ${error.message}`
      });
    }
  }
});

// Setup the Express events endpoint for Slack
app.post('/slack/events', (req, res) => {
  if (req.body.type === 'url_verification') {
    // Handle Slack URL verification
    return res.send({ challenge: req.body.challenge });
  }
  
  // Let the Slack app process the event
  slackApp.processEvent(req.body);
  res.sendStatus(200);
});

module.exports = app;
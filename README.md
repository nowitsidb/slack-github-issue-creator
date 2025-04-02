# Slack to GitHub Issue Creator

A lightweight Node.js application that automatically converts Slack threads into GitHub issues.

## Features

- **Slash Command**: Use `/create-issue` in any Slack thread to create a GitHub issue
- **Automatic Trigger**: Simply mention `#create-issue` in any thread message
- **Rich Formatting**: Preserves message formatting and includes file attachments
- **User Attribution**: Includes Slack usernames in the created issue
- **Custom Labels**: Automatically adds configurable labels to created issues

## File Structure

```
slack-github-issue-creator/
├── README.md               # This documentation
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Node.js dependencies
├── src/
│   ├── index.js            # Application entry point
│   ├── app.js              # Express and Slack app setup
│   ├── services/
│   │   ├── githubService.js # GitHub API interaction
│   │   └── slackService.js  # Slack message processing
```

## Prerequisites

- Node.js (v14 or later)
- A Slack workspace where you can create apps
- A GitHub account with repository access

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/slack-github-issue-creator.git
cd slack-github-issue-creator
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit the `.env` file and add your Slack and GitHub credentials:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-github-username-or-org
GITHUB_REPO=your-repository-name
PORT=3000
```

## Slack App Setup

1. **Create a Slack App**

   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App" → "From scratch"
   - Name your app and select your workspace

2. **Configure Bot Token Scopes**

   - Navigate to "OAuth & Permissions"
   - Add the following scopes:
     - `commands` (for slash commands)
     - `channels:history` (to read messages)
     - `chat:write` (to post responses)
     - `groups:history` (for private channels)
   - Install the app to your workspace
   - Copy the "Bot User OAuth Token" to your `.env` file

3. **Set Up Slash Command**

   - Go to "Slash Commands" and create a new command
   - Command: `/create-issue`
   - Request URL: `https://your-app-url.com/slack/events`
   - Description: "Create a GitHub issue from this thread"

4. **Configure Event Subscriptions**

   - Enable events and set Request URL to `https://your-app-url.com/slack/events`
   - Subscribe to bot events: `message.channels` and `message.groups`
   - Save changes

5. **Basic Information**

   - Copy "Signing Secret" to your `.env` file as `SLACK_SIGNING_SECRET`

## GitHub Setup

1. **Create a Personal Access Token**

   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Generate a new token with `repo` scope
   - Copy token to your `.env` file as `GITHUB_TOKEN`

2. **Set Repository Details**

   - Set `GITHUB_OWNER` to your GitHub username or organization name
   - Set `GITHUB_REPO` to the repository where issues should be created

## Running the App

1. **Start the app locally**

```bash
npm start
```

2. **Deploy to a server**

For production use, deploy to a server with a public URL (Heroku, Render, DigitalOcean, etc.).

Make sure your server URL matches the URL you configured in your Slack app settings.

## Usage

### Option 1: Use the Slash Command

In any Slack thread, type `/create-issue` to create a GitHub issue from all messages in the thread.

### Option 2: Use the Trigger Phrase

Simply mention `#create-issue` in any message within a thread to automatically create an issue.

## Customization

You can customize the app by editing the following files:

- `src/services/githubService.js`: Change issue formatting, labels, etc.
- `src/services/slackService.js`: Modify how Slack messages are processed
- `src/app.js`: Add additional commands or event handlers

## Troubleshooting

**Issue: App responds with "Invalid request" in Slack**
- Check that your `SLACK_SIGNING_SECRET` is correct
- Verify your server is accessible from the internet

**Issue: Cannot create GitHub issues**
- Ensure your `GITHUB_TOKEN` has the `repo` scope
- Check that the repository exists and you have permission to create issues

**Issue: Slash command not working**
- Verify the command is properly registered in your Slack app
- Check server logs for detailed error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
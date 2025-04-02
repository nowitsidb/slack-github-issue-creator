// Application entry point
require('dotenv').config();

// Verify critical .env file exists
const fs = require('fs');
const path = require('path');

if (!fs.existsSync(path.join(__dirname, '..', '.env'))) {
  console.error('\n❌ ERROR: .env file not found!');
  console.error('❌ Please create a .env file in the project root:');
  console.error('❌ cp .env.example .env');
  console.error('❌ Then edit the .env file to add your credentials.\n');
  console.error('ℹ️  See QUICK-START.md for detailed instructions.\n');
  process.exit(1);
}

const app = require('./app');

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Slack to GitHub Issue Creator is active!`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (!process.env.GITHUB_TOKEN || !process.env.SLACK_BOT_TOKEN || !process.env.SLACK_SIGNING_SECRET) {
    console.warn('⚠️  Missing required environment variables. Check your .env file.');
  } else {
    console.log(`✓ Using GitHub repository: ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
  }
});
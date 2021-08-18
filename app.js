require('dotenv').config()

const { App } = require('@slack/bolt');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Listens to incoming messages that contain "hello"
app.message('hello', async ({ message, say }) => {
  console.log(JSON.stringify(message,null,2))
  // say() sends a message to the channel where the event was triggered
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  const PORT = process.env.PORT || 3000
  await app.start(PORT);

  console.log(`⚡️ Bolt app is running ${PORT}!`);
})();

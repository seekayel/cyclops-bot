const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const crypto = require('crypto');

const { WebClient } = require('@slack/web-api');

// Read a token from the environment variables
const token = process.env.SLACK_BOT_TOKEN;

// Initialize
const web = new WebClient(token);

const app = express();

const rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

const verifySignature = function(req) {
  const signature = req.headers['x-slack-signature']
  const timestamp = req.headers['x-slack-request-timestamp']
  const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
  const [version, hash] = signature.split('=')

  hmac.update(`${version}:${timestamp}:${req.rawBody}`)

  return hmac.digest('hex') === hash
};

/*
 * Parse application/x-www-form-urlencoded && application/json
 */

app.use(bodyParser.urlencoded({verify: rawBodySaver, extended: true }));
app.use(bodyParser.json({ verify: rawBodySaver }));

app.post('/commands', async (req, res) => {
  const { token, challenge, type, channel, thread_ts } = req.body;

  console.log(JSON.stringify(req.headers,null,2))
  console.log(JSON.stringify(req.body,null,2))

  // check that the request signature matches expected value
  if (verifySignature(req)) {
    if (challenge) {
      res.send(challenge);
    } else {
      const result = await web.chat.postMessage({
        text: 'Hello world!',
        channel: channel,
        thread_ts: thread_ts
      });
      console.log(JSON.stringify(result))
      res.sendStatus(200)
    }
  } else {
    res.sendStatus(500);
  }
})

app.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload);

  // check that the verification token matches expected value
  if (verifySignature(req)) {
    res.send('');
  } else {
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});

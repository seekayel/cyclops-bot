const express = require('express');
const CryptoJS = require("crypto-js");

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
  if(!process.env.SLACK_SIGNING_SECRET) {
    console.log('ERROR: must set process.env.SLACK_SIGNING_SECRET')
    throw new Error('No Slack Signing Secret set for your app.')
  }
  const signature = req.headers['x-slack-signature']
  const timestamp = req.headers['x-slack-request-timestamp']

  if(!signature) {
    console.log('ERROR: must send x-slack-signature header')
    throw new Error('Invalid x-slack-signature.')
  }
  if(!timestamp) {
    console.log('ERROR: must send x-slack-request-timestamp')
    throw new Error('x-slack-request-timestamp is required.')
  }
  if (!signature.includes('=')){
    throw new Error('Unable to split signature on =')
  }
  const [version, hash] = signature.split('=')

  // const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
  // hmac.update(`${version}:${timestamp}:${req.rawBody}`)
  // return hmac.digest('hex') === hash

  console.log(req.rawBody)
  var message = `${version}:${timestamp}:${req.rawBody}`
  var shouldBe = CryptoJS.HmacSHA256(message, process.env.SLACK_SIGNING_SECRET).toString()
  return shouldBe === hash
};

const authenticate = function(req,res,next) {
  if(!verifySignature(req)) {
    res.sendStatus(403)
    return
  }

  const { challenge } = req.body;
  if (challenge) {
    res.send(challenge).sendStatus(200);
  } else {
    next()
  }
  return
}


/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(express.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(express.json({ verify: rawBodySaver }));
app.use(authenticate)


app.post('/commands', async (req, res) => {
  const { channel, event_ts } = req.body.event;

  console.log(JSON.stringify(req.headers,null,2))
  console.log(JSON.stringify(req.body,null,2))

  const result = await web.chat.postMessage({
    text: 'Hello world!',
    channel: channel,
    event_ts: event_ts
  });
  console.log(JSON.stringify(result))
  res.sendStatus(200)
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Slackbot listening on port ${PORT}!`);
});

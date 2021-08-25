const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const crypto = require('crypto');

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

app.post('/commands', (req, res) => {
  const { token, challenge, type } = req.body;

  console.log(JSON.stringify(req.headers,null,2))
  console.log(JSON.stringify(req.body,null,2))

  // check that the request signature matches expected value
  if (verifySignature(req)) {
    res.send(challenge);
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

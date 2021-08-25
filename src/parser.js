

const emailRegEx = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/

module.exports.findEmails = (text) => {
  return text.match(emailRegEx)
}



const emailRegEx = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/

module.exports.findEmail = (text) => {
  return text.match(emailRegEx)
}

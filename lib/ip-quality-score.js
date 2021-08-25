const axios = require('axios')


module.exports.verifyEmail = async (email) => {
  var key = process.env.cyclic_app_env_API_KEY

  if (key === undefined) {
    res.body = {"msg":"Define a body with a valid 'apiKey' eg: {'apiKey':'some-value'} or an 'API_KEY' environment variable"}
    return
  }

  var response = await axios.get(`https://ipqualityscore.com/api/json/email/${key}/${email}`)
  console.log(response.data);

  return response.data
}

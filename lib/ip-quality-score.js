const axios = require('axios')


module.exports.verifyEmail = async (email) => {
  var key = process.env.API_KEY

  if (key === undefined) {
    throw new Error('No process.env.API_KEY defined.')
  }

  var response = await axios.get(`https://ipqualityscore.com/api/json/email/${key}/${email}`)
  console.log(response.data);

  return response.data
}

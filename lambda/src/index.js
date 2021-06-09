const grant = require('grant').aws({
  config: {/*configuration - see below*/}, session: {secret: 'grant'}
})

exports.handler = async event => {

  const {redirect, response} = await grant(event)
  
  return redirect || {
    statusCode: 200,
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(response)
  }
}

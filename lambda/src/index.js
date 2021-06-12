import grant from 'grant'
import config from './config.json'

grant.aws(config)

exports.handler = async event => {

  const {redirect, response} = await grant(event)
  
  return redirect || {
    statusCode: 200,
    headers: {'content-type': 'application/json'},
    body: JSON.stringify(response)
  }
}

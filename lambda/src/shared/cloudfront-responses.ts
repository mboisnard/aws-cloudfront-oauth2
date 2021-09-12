import {CloudFrontHeaders, CloudFrontResultResponse} from 'aws-lambda';
import {OPENID_CONFIGURATION} from './settings';

// Generate Unauthorized response in viewer request event or origin request event
export function createUnauthorizedResponse(url: string): CloudFrontResultResponse {

  return {
    status: '401',
    statusDescription: 'Unauthorized',
    headers: {
      'WWW-Authenticate': [{
        key: 'WWW-Authenticate',
        value: `${OPENID_CONFIGURATION.unauthorizedScheme} realm=${url}`
      }]
    }
  };
}

export function createLoginPageResponse(url: string): CloudFrontResultResponse {

  return {
    status: '307',
    statusDescription: 'Temporary Redirect',
    body: '<html><body><h1>coucou</h1></body></html>'
  };
}

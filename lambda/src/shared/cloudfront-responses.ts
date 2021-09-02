import { CloudFrontHeaders, CloudFrontResultResponse } from 'aws-lambda';
import { OPENID_CONFIGURATION } from './settings';

// Generate Unauthorized response in viewer request event or origin request event
export function createUnauthorizedResponse(url: string, headers: CloudFrontHeaders): CloudFrontResultResponse {

    return {
        status: '401',
        statusDescription: 'Unauthorized',
        headers: {
            'WWW-Authenticate': [{
                key: 'WWW-Authenticate',
                value: `${OPENID_CONFIGURATION.unauthorizedScheme} realm=${url}`
            }],
            ...headers
        }
    };
}

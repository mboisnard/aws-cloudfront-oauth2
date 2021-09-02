import { CloudFrontHeaders, CloudFrontResultResponse } from "aws-lambda";
import { OPENID_CONFIGURATION } from "../shared/settings";

// Generate Unauthorize response in viewer request event or origin request event
export function createUnauthorizedResponse(url: string, headers: CloudFrontHeaders): CloudFrontResultResponse {

    return {
        status: '401',
        statusDescription: 'Unauthorized',
        headers: {
            'WWW-Authenticate': [{
                key: 'WWW-Authenticate',
                value: `${OPENID_CONFIGURATION.unauthorizeScheme} realm=${url}`
            }],
            ...headers
        }
    };
};

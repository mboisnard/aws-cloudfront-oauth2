import { CloudFrontRequestHandler } from "aws-lambda";
import { extractCookiesFrom } from "../shared/cookies";
import { getSessionFrom } from "../shared/session";
import { getOpenIdClientFrom } from "../shared/openid";
import { createUnauthorizedResponse } from "../shared/cloudfront-responses";
import { SESSION_CONFIGURATION, OPENID_CONFIGURATION } from "../shared/settings";

export const handler: CloudFrontRequestHandler = async (event) => {

    const request = event.Records[0].cf.request;
    const domainName = request.headers["host"][0].value;
    const requestedUri = `${request.uri}${
        request.querystring ? "?" + request.querystring : ""
    }`;

    const headers = request.headers;
    const cookies = extractCookiesFrom(headers);
    const openIdClient = await getOpenIdClientFrom(OPENID_CONFIGURATION);

    try {
        const session = await getSessionFrom(cookies, SESSION_CONFIGURATION);
        console.log("sessionId : " + JSON.stringify(session));

    } catch (err) {
        const authorizationUrl = openIdClient.authorizationUrl();
        console.log("authorization url : " + authorizationUrl);

        //TODO create session
        return createUnauthorizedResponse(authorizationUrl, headers);
    }

    // Return the request unaltered to allow access to the resource:
    console.log("request : " + JSON.stringify(request) + " " + domainName + " " + requestedUri);
    console.log("cookies : " + JSON.stringify(cookies));

    return request;
};
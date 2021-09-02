import { OpenIdConfiguration } from "./openid";
import { SessionConfiguration } from "./session";
import { generators } from "openid-client";

export const SESSION_CONFIGURATION: SessionConfiguration = {
    cookie: {
        name: 'SESSION_ID',
        path: '/',
        httpOnly: true,
        secure: true,
        maxAge: undefined,
        sameSite: 'Lax'
    },
    secret: 'this is a secret',
    genid: (_req) => generators.random()
};

export const OPENID_CONFIGURATION: OpenIdConfiguration = {
    issuer: {
        uri: 'https://keycloak.url'
    },
    client: {
        id: 'clientId',
        secret: 'secret'
    },
    redirectUrl: 'https://cloudfront.url/oauth/callback',
    responseType: 'code',
    unauthorizeScheme: 'CUSTOMSSO'
};

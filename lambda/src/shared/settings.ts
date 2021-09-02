import {OpenIdConfiguration} from './openid';
import {SessionConfiguration} from './session';
import {generators} from 'openid-client';
import {DynamoDBSessionStore} from './dynamodb-session-store';

export const SESSION_CONFIGURATION: SessionConfiguration = {
  cookie: {
    name: 'SESSION_ID',
    path: '/',
    httpOnly: true,
    secure: true,
    maxAge: undefined,
    sameSite: 'Lax'
  },
  secret: 'thisisasecret',
  genid: (_req) => generators.random(),
  store: new DynamoDBSessionStore()
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

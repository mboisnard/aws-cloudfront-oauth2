import {Issuer, ResponseType} from 'openid-client';

export type OpenIdConfiguration = {
  issuer: {
    uri: string
  },
  client: {
    id: string,
    secret: string
  },
  redirectUrl: string,
  responseType: ResponseType,
  unauthorizedScheme: string
};

export async function getOpenIdClientFrom(config: OpenIdConfiguration) {

  const issuer = await Issuer.discover(config.issuer.uri);

  return new issuer.Client({
    client_id: config.client.id,
    client_secret: config.client.secret,
    redirect_uris: [config.redirectUrl],
    response_types: [config.responseType]
  });
}

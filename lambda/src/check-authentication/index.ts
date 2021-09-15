import {CloudFrontHeaders, CloudFrontRequest, CloudFrontRequestHandler} from 'aws-lambda';
import {isRequestFromSPA} from '../shared/headers';
import {getSessionFrom, Session} from '../shared/session';
import {getOpenIdClientFrom} from '../shared/openid';
import {createLoginPageResponse, createUnauthorizedResponse} from '../shared/cloudfront-responses';
import {OPENID_CONFIGURATION, SESSION_CONFIGURATION} from '../shared/settings';
import {Client} from 'openid-client';
import {extractCookiesFrom} from '../shared/cookies';

export const handler: CloudFrontRequestHandler = async (event) => {

  const request = event.Records[0].cf.request;
  console.log('request : ' + JSON.stringify(request));

  const headers = request.headers;
  console.log('headers : ' + JSON.stringify(headers));
  const cookies = extractCookiesFrom(headers);
  console.log('cookies : ' + JSON.stringify(cookies));
  const openIdClient = await getOpenIdClientFrom(OPENID_CONFIGURATION);
  console.log('openidclient initialized');

  const session = await getSessionFrom(cookies, SESSION_CONFIGURATION);

  if (!session) {
    console.log('session not exists');
    const createdSession = await createSession(request);
    return unauthorizedResponse(createdSession, openIdClient, headers);
  }

  if (session.isExpired()) {

    try {
      const tokenSet = await openIdClient.refresh(session.refreshToken as string);

      session.accessToken = tokenSet.access_token;
      session.idToken = tokenSet.id_token;
      session.refreshToken = tokenSet.refresh_token;

      await session.update();
    } catch (err) {
      console.error('error when trying to refresh tokens for session: ' + err);
      const createdSession = await createSession(request);
      return unauthorizedResponse(createdSession, openIdClient, headers);
    }
  }

  // Return the request unaltered to allow access to the resource
  // TODO Add Authorization Header : Bearer + idToken
  //request.headers['authorization'] = `Bearer ${session.idToken}`;
  return request;
};

async function createSession(request: CloudFrontRequest): Promise<Session> {
  const newSession = new Session(request, SESSION_CONFIGURATION);
  return newSession.save();
}

function unauthorizedResponse(session: Session | null, openIdClient: Client, headers: CloudFrontHeaders) {
  const authorizationUrl = openIdClient.authorizationUrl();
  console.log('authorization url : ' + authorizationUrl);

  if (isRequestFromSPA(headers)) {
    return createUnauthorizedResponse(authorizationUrl);
  }

  return createLoginPageResponse(authorizationUrl);
}


/*
1a) Si (aucun cookie (SESSION_ID) || aucune session en BDD) && Header X-Requested-With === XMLHttpRequest
  -> Création session en BDD, stockage du Referer en info de session
  -> return 401 avec header WWW-Authenticate === 'CUSTOMSSO realm={authorizationUrl}' et cookie SESSION_ID
1b) Si aucun cookie (SESSION_ID) || aucune session en BDD
  -> Création session en BDD, stockage du Referer en info de session
  -> redirect 307 sur template page login (ayant popup vers authorizationUrl) et cookie SESSION_ID
1c) Si cookie (SESSION_ID) && durée de session expirée en BDD (ttl automatique avec dynamodb)
  -> Retour à 1a) / 1b)
1d) Si cookie (SESSION_ID) && token JWT expiré dans la session en BDD
  -> Tentative de refresh token
    -> Si tentative échouée retour à 1a)
1e) Si cookie (SESSION_ID) && session ok en BDD
  -> Ajout Header Authorization === 'Bearer {accessToken}'
  -> Passage à l'origine
 */

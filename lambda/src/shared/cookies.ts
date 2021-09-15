import {CloudFrontHeaders} from 'aws-lambda';
import {extractMultiValuesHeaderFrom, MultiValuesHeader} from './headers';
import {sign, unsign} from 'cookie-signature';
import {SESSION_CONFIGURATION} from './settings';

export type Cookies = MultiValuesHeader;

// Cookies are present in the HTTP header "Cookie" that may be present multiple times.
// This utility function parses occurrences of that header and splits out all the cookies and their values
// A simple object is returned that allows easy access by cookie name: e.g. cookies["nonce"]
export function extractCookiesFrom(headers: CloudFrontHeaders): Cookies {
  return extractMultiValuesHeaderFrom(headers, 'cookie') as Cookies;
}

export function getSessionIdFrom(cookies: Cookies): Promise<string> {

  const sessionId = cookies[SESSION_CONFIGURATION.cookie.name];

  if (!sessionId) {
    return Promise.reject('SessionId not found');
  }

  return unSignCookieValue(sessionId);
}

export function signCookieValue(value: string): string {
  return sign(value, SESSION_CONFIGURATION.secret);
}

async function unSignCookieValue(value: string): Promise<string> {

  const unsignedValue = unsign(value, SESSION_CONFIGURATION.secret);

  if (!unsignedValue)
    return Promise.reject(`Value is not sign with the configured secret. Signed Value : ${value}`);

  return Promise.resolve(unsignedValue);
}

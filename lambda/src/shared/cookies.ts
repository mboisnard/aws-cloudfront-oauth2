import {CloudFrontHeaders} from 'aws-lambda';
import {parse} from 'cookie';

export type Cookies = {
  [key: string]: string
};

// Cookies are present in the HTTP header "Cookie" that may be present multiple times.
// This utility function parses occurrences of that header and splits out all the cookies and their values
// A simple object is returned that allows easy access by cookie name: e.g. cookies["nonce"]
export function extractCookiesFrom(headers: CloudFrontHeaders) {

  if (!headers['cookie']) {
    return {};
  }

  const cookies = headers['cookie'].reduce(
    (reduced, header) => Object.assign(reduced, parse(header.value)),
    {} as Cookies
  );

  return cookies;
}

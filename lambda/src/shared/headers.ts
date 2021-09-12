import {CloudFrontHeaders} from 'aws-lambda';
import {parse} from 'cookie';

export type MultiValuesHeader = {
  [key: string]: string
};

export type Cookies = MultiValuesHeader;

// Cookies are present in the HTTP header "Cookie" that may be present multiple times.
// This utility function parses occurrences of that header and splits out all the cookies and their values
// A simple object is returned that allows easy access by cookie name: e.g. cookies["nonce"]
export function extractCookiesFrom(headers: CloudFrontHeaders): Cookies {
  return extractMultiValuesHeaderFrom(headers, 'cookie') as Cookies;
}

export function isRequestFromSPA(headers: CloudFrontHeaders) {

  const requestedWithHeader = extractSimpleValueHeaderFrom(headers, 'X-Requested-With');

  return requestedWithHeader === 'XMLHttpRequest';
}

export function extractRefererFrom(headers: CloudFrontHeaders) {

  return extractSimpleValueHeaderFrom(headers, 'X-SPA-Referer')
    || extractSimpleValueHeaderFrom(headers, 'Referer');
}

function extractSimpleValueHeaderFrom(headers: CloudFrontHeaders, searchedHeader: string) {

  const normalizedHeaderName = searchedHeader.toLowerCase();
  if (!headers[normalizedHeaderName] || headers[normalizedHeaderName].length === 0) {
    return undefined;
  }

  return headers[normalizedHeaderName][0].value;
}

function extractMultiValuesHeaderFrom(headers: CloudFrontHeaders, searchedHeader: string) {

  const normalizedHeaderName = searchedHeader.toLowerCase();

  if (!headers[normalizedHeaderName]) {
    return {};
  }

  const multiValuesHeader = headers[normalizedHeaderName].reduce(
    (reduced, header) => Object.assign(reduced, parse(header.value)),
    {} as MultiValuesHeader
  );

  return multiValuesHeader;
}

import {CloudFrontHeaders} from 'aws-lambda';
import {parse} from 'cookie';

export type MultiValuesHeader = {
  [key: string]: string
};

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

export function extractMultiValuesHeaderFrom(headers: CloudFrontHeaders, searchedHeader: string) {

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

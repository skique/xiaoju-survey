import qs from 'qs';

export function generateUrl(url: string, query: Record<string, any>): string {
  const queryString = qs.stringify(query);
  return url.indexOf('?') > 0
    ? `${url}&${queryString}`
    : `${url}?${queryString}`;
}

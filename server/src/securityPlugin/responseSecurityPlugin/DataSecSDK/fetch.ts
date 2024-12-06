import http from 'http';
import https from 'https';
// import metrics from '@didi/nodex-metrics';

const agentOption: http.AgentOptions | https.AgentOptions = { keepAlive: true, keepAliveMsecs: 5000 };
const httpAgent = new http.Agent(agentOption);
const httpsAgent = new https.Agent(agentOption);

export function fetch<T>(
  url: string,
  { body, ...options }: (http.RequestOptions | https.RequestOptions) & { body?: T | object } = {},
) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    try {
      const isHttps = url.startsWith('https');
      const client = isHttps ? https : http;
      options.agent = isHttps ? httpsAgent : httpAgent;

      const hasBody = body != null;
      const isForm = typeof body === 'string';
      const isJSON = hasBody && !isForm;

      let data = isJSON ? JSON.stringify(body) : undefined;

      if (isJSON) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data ?? ''),
        };
      }

      const req = client.request(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
        //   metrics.rpc('http-fetch', {
        //     result: 'ok',
        //     time: Date.now() - startTime,
        //     callee: url,
        //   });

          if (isJSON) {
            data = JSON.parse(data);
          }

          resolve(data);
        });
      });

      req.on('error', (error) => {
        // metrics.rpc('http-fetch', {
        //   result: 'error',
        //   time: Date.now() - startTime,
        //   callee: url,
        // });

        reject(error);
      });

      if (isJSON) {
        req.write(data);
      }

      req.end();
    } catch (error) {
    //   metrics.rpc('http-fetch', {
    //     result: 'error',
    //     time: Date.now() - startTime,
    //     callee: url,
    //   });

      reject(error);
    }
  });
}

export default fetch;

import { createClient } from '@base44/sdk';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { appParams } from '@/lib/app-params';

let _client = null;

export const backendClient = new Proxy({}, {
  get(_, prop) {
    if (!_client) {
      const { appId, token, functionsVersion, appBaseUrl } = appParams;
      _client = createClient({
        appId,
        token,
        functionsVersion,
        serverUrl: '',
        requiresAuth: false,
        appBaseUrl,
      });
    }
    return _client[prop];
  },
});

export { createAxiosClient };

import { createClient } from '@base44/sdk';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;
export const backendClient = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

export { createAxiosClient };

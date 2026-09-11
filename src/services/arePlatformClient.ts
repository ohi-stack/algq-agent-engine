export type ARERequestContext = {
  correlationId?: string;
  idempotencyKey?: string;
  dealId?: string;
  agentId?: string;
};

export type AREPlatformErrorBody = {
  code?: string;
  message?: string;
  data?: unknown;
};

/**
 * Thin client for the canonical ARE API boundary.
 *
 * The Agent Engine never owns canonical Deal, underwriting, offer, document,
 * funding or closing records. Those operations are routed to the ARE Platform
 * and its authoritative companion services.
 */
export class AREPlatformClient {
  private readonly baseUrl: string;

  constructor(baseUrl = import.meta.env.VITE_ARE_API_BASE_URL ?? '') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  async health(): Promise<unknown> {
    return this.request('/health', { method: 'GET' });
  }

  async getDeal(dealId: string, context: ARERequestContext = {}): Promise<unknown> {
    return this.request(`/deals/${encodeURIComponent(dealId)}`, {
      method: 'GET',
      context: { ...context, dealId },
    });
  }

  async callService(
    service: string,
    operation: string,
    payload: Record<string, unknown> = {},
    context: ARERequestContext = {},
  ): Promise<unknown> {
    return this.request('/services/call', {
      method: 'POST',
      body: { service, operation, payload, context },
      context,
    });
  }

  private async request(
    path: string,
    options: {
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: unknown;
      context?: ARERequestContext;
    },
  ): Promise<unknown> {
    if (!this.isConfigured()) {
      throw new Error('ARE API is not configured. Set VITE_ARE_API_BASE_URL before enabling live platform calls.');
    }

    const context = options.context ?? {};
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (context.correlationId) headers['X-ARE-Correlation-ID'] = context.correlationId;
    if (context.idempotencyKey) headers['Idempotency-Key'] = context.idempotencyKey;
    if (context.dealId) headers['X-ARE-Deal-ID'] = context.dealId;
    if (context.agentId) headers['X-ARE-Agent-ID'] = context.agentId;

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'include',
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const errorBody = (body ?? {}) as AREPlatformErrorBody;
      throw new Error(errorBody.message ?? `ARE API request failed with HTTP ${response.status}.`);
    }

    return body;
  }
}

export const arePlatformClient = new AREPlatformClient();

const BASE_URL = "https://panel.proxyline.net/api";

export class ProxylineClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildUrl(path: string, params?: Record<string, string | string[]>): string {
    const url = new URL(`${BASE_URL}/${path}/`);
    url.searchParams.set("api_key", this.apiKey);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          for (const v of value) {
            url.searchParams.append(key, v);
          }
        } else if (value !== undefined && value !== "") {
          url.searchParams.set(key, value);
        }
      }
    }

    return url.toString();
  }

  private async request<T = unknown>(
    method: "GET" | "POST",
    path: string,
    params?: Record<string, string | string[]>,
    body?: Record<string, string | string[]>
  ): Promise<T> {
    const url = this.buildUrl(path, method === "GET" ? params : undefined);

    const init: RequestInit = { method };

    if (method === "POST") {
      // POST params go as query params for proxy filters (e.g. proxies/tags)
      // POST body goes as form data
      if (body) {
        const formData = new URLSearchParams();
        for (const [key, value] of Object.entries(body)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              formData.append(key, v);
            }
          } else {
            formData.append(key, value);
          }
        }
        init.body = formData.toString();
        init.headers = { "Content-Type": "application/x-www-form-urlencoded" };
      }
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      const text = await response.text();
      let errorMsg: string;
      try {
        const errors = JSON.parse(text);
        errorMsg = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join("; ");
      } catch {
        errorMsg = text;
      }
      throw new Error(`API error ${response.status}: ${errorMsg}`);
    }

    return response.json() as Promise<T>;
  }

  // GET endpoints
  async getProxies(params?: Record<string, string | string[]>) {
    return this.request("GET", "proxies", params);
  }

  async getOrders(params?: Record<string, string>) {
    return this.request("GET", "orders", params);
  }

  async getCountries() {
    return this.request("GET", "countries");
  }

  async getIps(params: Record<string, string>) {
    return this.request("GET", "ips", params);
  }

  async getIpsCount(params: Record<string, string>) {
    return this.request("GET", "ips-count", params);
  }

  async getBalance() {
    return this.request("GET", "balance");
  }

  async getTags() {
    return this.request("GET", "tags");
  }

  // POST endpoints
  async renewProxies(body: Record<string, string | string[]>) {
    return this.request("POST", "renew", undefined, body);
  }

  async createOrder(body: Record<string, string | string[]>) {
    return this.request("POST", "new-order", undefined, body);
  }

  async getOrderAmount(body: Record<string, string | string[]>) {
    return this.request("POST", "new-order-amount", undefined, body);
  }

  async manageProxyTags(
    filterParams: Record<string, string | string[]>,
    body: Record<string, string | string[]>
  ) {
    const url = this.buildUrl("proxies/tags", filterParams);

    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(body)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          formData.append(key, v);
        }
      } else {
        formData.append(key, value);
      }
    }

    const response = await fetch(url, {
      method: "POST",
      body: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg: string;
      try {
        const errors = JSON.parse(text);
        errorMsg = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join("; ");
      } catch {
        errorMsg = text;
      }
      throw new Error(`API error ${response.status}: ${errorMsg}`);
    }

    return response.json();
  }
}

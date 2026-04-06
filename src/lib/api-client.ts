// API Client for communicating with the backend
const API_BASE_URL = 'http://192.168.3.131:4000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}/api${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth endpoints
  async linkSeller(googleUserId: string, sellerId: string) {
    return this.request('/auth/link-seller', {
      method: 'POST',
      body: JSON.stringify({ googleUserId, sellerId }),
    });
  }

  async createMagicSession(token: string) {
    return this.request('/auth/magic-session', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async getSellerContext(token: string) {
    return this.request('/auth/seller-context', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Catalog endpoints
  async getCatalogProducts(sellerId: string) {
    return this.request(`/catalog/products?seller_id=${sellerId}`);
  }

  async createProduct(productData: any) {
    return this.request('/catalog/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async syncCatalog(sellerId: string) {
    return this.request('/catalog/sync', {
      method: 'POST',
      body: JSON.stringify({ sellerId }),
    });
  }

  async uploadImage(formData: FormData) {
    return this.request('/catalog/upload-image', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // Dashboard / data endpoints
  async getDashboardStats(sellerId: string) {
    return this.request(`/dashboard/stats?seller_id=${sellerId}`);
  }

  async getOrders(sellerId: string) {
    return this.request(`/orders?seller_id=${sellerId}`);
  }

  async getServiceOrders(sellerId: string) {
    return this.request(`/service-orders?seller_id=${sellerId}`);
  }

  async getCatalog(sellerId: string) {
    return this.request(`/catalog?seller_id=${sellerId}`);
  }

  async saveCatalogItem(sellerId: string, item: any) {
    return this.request('/catalog', {
      method: 'POST',
      body: JSON.stringify({ seller_id: sellerId, ...item }),
    });
  }

  async deleteCatalogItem(itemId: string) {
    return this.request(`/catalog/${itemId}`, { method: 'DELETE' });
  }

  async getSeller(sellerId: string) {
    return this.request(`/sellers/${sellerId}`);
  }

  // Order endpoints
  async validateOrder(orderData: any) {
    return this.request('/catalog/validate-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Payment endpoints
  async createTopupOrder(orderData: any) {
    return this.request('/topup/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async verifyPayment(paymentData: any) {
    return this.request('/topup/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // VAPI endpoints
  async getAvailability(sellerId: string) {
    return this.request(`/vapi/availability?seller_id=${sellerId}`);
  }

  async bookAppointment(appointmentData: any) {
    return this.request('/vapi/book', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getConversations(sellerId: string) {
    return this.request(`/vapi/conversations?seller_id=${sellerId}`);
  }

  // Admin endpoints
  async getUsageStats(sellerId?: string) {
    const endpoint = sellerId ? `/admin/usage?seller_id=${sellerId}` : '/admin/usage';
    return this.request(endpoint);
  }

  async getOraMetrics() {
    return this.request('/admin/ora-metrics');
  }

  // Configuration endpoints
  async getConfigurations(sellerId: string) {
    return this.request(`/configurations?seller_id=${sellerId}`);
  }

  async updateConfigurations(sellerId: string, config: any) {
    return this.request('/configurations', {
      method: 'POST',
      body: JSON.stringify({ sellerId, ...config }),
    });
  }

  // Verification endpoints
  async pollVerificationStatus(sellerId: string) {
    return this.request(`/verification/poll?seller_id=${sellerId}`);
  }

  async getVerificationStatus(sellerId: string) {
    return this.request(`/verification/status/${sellerId}`);
  }

  // Inquiries endpoints
  async getInquiries(sellerId: string) {
    return this.request(`/inquiries?seller_id=${sellerId}`);
  }

  async createInquiry(inquiryData: any) {
    return this.request('/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };

// Export types
export type { ApiResponse };
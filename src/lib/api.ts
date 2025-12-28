/**
 * API Client for NDAX Quantum Engine Backend
 * Provides type-safe communication with Node.js and Python backends
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:5000';

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface TradingOrder {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  orderType: 'MARKET' | 'LIMIT';
  price?: number;
  executionPrice?: number;
  executedQty?: number;
  status: string;
  timestamp: string;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  realized_pnl: number;
  opened_at: string;
  status: string;
}

export interface QuantumAnalysis {
  strategyType: string;
  symbol: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  signals: Record<string, number>;
  technicalIndicators?: Record<string, number>;
  timestamp: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  high24h: number;
  low24h: number;
  timestamp: string;
}

export interface FreelanceJob {
  id: string;
  title: string;
  platform: string;
  budget: number;
  category: string;
  description: string;
  skills: string[];
  posted: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: string;
  version: string;
  system: {
    backend: string;
    trading_engine?: string;
    quantum_engine?: string;
  };
}

export interface Metrics {
  timestamp: string;
  uptime: {
    seconds: number;
    formatted: string;
  };
  requests: {
    total: number;
    errors: number;
    per_second: number;
    error_rate: string;
  };
  trading?: {
    total_trades: number;
    active_positions: number;
  };
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
  private baseUrl: string;
  private pythonUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL, pythonUrl: string = PYTHON_API_URL) {
    this.baseUrl = baseUrl;
    this.pythonUrl = pythonUrl;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Merge any existing headers
      if (options.headers) {
        const existingHeaders = options.headers as Record<string, string>;
        Object.assign(headers, existingHeaders);
      }

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      
      // Handle both wrapped and unwrapped responses
      if (data.success !== undefined) {
        return data;
      }
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ============================================================================
  // Health & Metrics
  // ============================================================================

  async getHealth(): Promise<ApiResponse<HealthStatus>> {
    return this.request<HealthStatus>(`${this.baseUrl}/api/health`);
  }

  async getPythonHealth(): Promise<ApiResponse<HealthStatus>> {
    return this.request<HealthStatus>(`${this.pythonUrl}/api/health`);
  }

  async getMetrics(): Promise<ApiResponse<Metrics>> {
    return this.request<Metrics>(`${this.pythonUrl}/api/metrics`);
  }

  // ============================================================================
  // Trading
  // ============================================================================

  async executeTrade(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    quantity: number;
    orderType?: 'MARKET' | 'LIMIT';
    price?: number;
  }): Promise<ApiResponse<TradingOrder>> {
    return this.request<TradingOrder>(`${this.pythonUrl}/api/trading/execute`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getOrders(params?: {
    symbol?: string;
    status?: string;
    limit?: number;
  }): Promise<ApiResponse<{ orders: TradingOrder[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.symbol) queryParams.append('symbol', params.symbol);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const url = `${this.pythonUrl}/api/trading/orders${query ? `?${query}` : ''}`;
    
    return this.request<{ orders: TradingOrder[]; total: number }>(url);
  }

  async getMarketData(symbol: string = 'BTC/USD', interval: string = '1m'): Promise<ApiResponse<MarketData>> {
    const url = `${this.pythonUrl}/api/trading/market-data?symbol=${symbol}&interval=${interval}`;
    return this.request<MarketData>(url);
  }

  // ============================================================================
  // Quantum Analysis
  // ============================================================================

  async performQuantumAnalysis(params: {
    strategyType: string;
    symbol: string;
    marketData?: Record<string, any>;
  }): Promise<ApiResponse<QuantumAnalysis>> {
    return this.request<QuantumAnalysis>(`${this.pythonUrl}/api/quantum/analyze`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getQuantumStrategies(): Promise<ApiResponse<{ strategies: any[] }>> {
    return this.request<{ strategies: any[] }>(`${this.pythonUrl}/api/quantum/strategies`);
  }

  // ============================================================================
  // AI Services
  // ============================================================================

  async getAIPrediction(params: {
    symbol: string;
    timeframe: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`${this.pythonUrl}/api/ai/predict`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getSentiment(symbol: string = 'BTC/USD'): Promise<ApiResponse<any>> {
    return this.request(`${this.pythonUrl}/api/ai/sentiment?symbol=${symbol}`);
  }

  // ============================================================================
  // Freelance
  // ============================================================================

  async getFreelanceJobs(params?: {
    platform?: string;
    category?: string;
    minBudget?: number;
  }): Promise<ApiResponse<{ jobs: FreelanceJob[]; total: number }>> {
    const queryParams = new URLSearchParams();
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.minBudget) queryParams.append('minBudget', params.minBudget.toString());

    const query = queryParams.toString();
    const url = `${this.pythonUrl}/api/freelance/jobs${query ? `?${query}` : ''}`;
    
    return this.request<{ jobs: FreelanceJob[]; total: number }>(url);
  }

  async submitProposal(params: {
    jobId: string;
    proposal: string;
    coverLetter?: string;
    bidAmount?: number;
  }): Promise<ApiResponse<{ proposalId: string; status: string }>> {
    return this.request<{ proposalId: string; status: string }>(`${this.pythonUrl}/api/freelance/submit-proposal`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============================================================================
  // Positions
  // ============================================================================

  async getPositions(): Promise<ApiResponse<{ positions: Position[]; total: number }>> {
    return this.request<{ positions: Position[]; total: number }>(`${this.pythonUrl}/api/positions`);
  }

  async getPosition(positionId: string): Promise<ApiResponse<{ position: Position }>> {
    return this.request<{ position: Position }>(`${this.pythonUrl}/api/positions/${positionId}`);
  }

  // ============================================================================
  // Risk Management
  // ============================================================================

  async evaluateRisk(params: {
    symbol: string;
    quantity: number;
    side?: 'BUY' | 'SELL';
  }): Promise<ApiResponse<{
    approved: boolean;
    riskScore: number;
    riskLevel: string;
    risks: string[];
  }>> {
    return this.request(`${this.pythonUrl}/api/risk/evaluate`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============================================================================
  // Compliance
  // ============================================================================

  async checkCompliance(params: any): Promise<ApiResponse<{
    compliant: boolean;
    region: string;
    checks: Record<string, boolean>;
    warnings: string[];
  }>> {
    return this.request(`${this.pythonUrl}/api/compliance/check`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ============================================================================
  // Automation
  // ============================================================================

  async getAutomationStatus(): Promise<ApiResponse<{
    enabled: boolean;
    mode: string;
    activeTasks: number;
    completedTasks: number;
    successRate: number;
  }>> {
    return this.request(`${this.pythonUrl}/api/automation/status`);
  }

  async configureAutomation(params: {
    mode: 'full' | 'partial' | 'minimal';
  }): Promise<ApiResponse<{ success: boolean; mode: string }>> {
    return this.request(`${this.pythonUrl}/api/automation/configure`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

const api = new ApiClient();

export default api;
export { ApiClient };

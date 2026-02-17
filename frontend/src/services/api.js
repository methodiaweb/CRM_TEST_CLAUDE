// API Service for CRM Frontend
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class APIService {
  constructor() {
    this.token = localStorage.getItem('crm_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('crm_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('crm_token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  logout() {
    this.clearToken();
  }

  // Leads
  async getLeads(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/leads${queryString ? `?${queryString}` : ''}`);
  }

  async getLead(id) {
    return this.request(`/leads/${id}`);
  }

  async createLead(leadData) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLeadStatus(id, status) {
    return this.request(`/leads/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async addComment(leadId, comment) {
    return this.request(`/leads/${leadId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }

  async getStats() {
    return this.request('/leads/stats/overview');
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUserPerformance() {
    return this.request('/users/performance');
  }

  // Files
  async addFile(leadId, name, type) {
    return this.request('/files', {
      method: 'POST',
      body: JSON.stringify({ leadId, name, type }),
    });
  }

  async getLeadFiles(leadId) {
    return this.request(`/files/lead/${leadId}`);
  }

  async deleteFile(fileId) {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/all/read', {
      method: 'PATCH',
    });
  }
}

const apiService = new APIService();
export default apiService;

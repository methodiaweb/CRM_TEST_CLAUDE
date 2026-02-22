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

  // Files - BASE64 DATABASE STORAGE
  async uploadFile(leadId, file, fileType, fileDate) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1]; // Remove data:...;base64, prefix
          
          const data = await this.request('/files/upload', {
            method: 'POST',
            body: JSON.stringify({
              leadId,
              fileName: file.name,
              fileType,
              fileDate,
              fileData: base64Data
            }),
          });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Грешка при четене на файл'));
      reader.readAsDataURL(file);
    });
  }

  // Backward-compat alias:
// Older frontend code may call api.addFile(...). Keep it working.
async addFile(leadId, file, fileType, fileDate) {
  return this.uploadFile(leadId, file, fileType, fileDate);
}
  
  async getLeadFiles(leadId) {
    return this.request(`/files/lead/${leadId}`);
  }

  async downloadFile(fileId) {
    // Open download in new tab
    const url = `${API_URL}/files/download/${fileId}`;
    const headers = {
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };

    try {
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'download';

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
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

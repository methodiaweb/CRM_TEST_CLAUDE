import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Plus, Search, TrendingUp, Clock, FileText, MessageSquare, 
  ChevronDown, ChevronRight, Upload, Download, X, Menu, Bell, LogOut, User,
  Phone, Mail, Paperclip, BarChart3,
  DollarSign, Target, AlertCircle, Loader
} from 'lucide-react';
import api from './services/api';

const STATUSES = [
  { id: 'new', label: 'Нов', color: 'bg-blue-100 text-blue-800' },
  { id: 'contacted', label: 'Контактуван', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'offer_sent', label: 'Оферта изпратена', color: 'bg-purple-100 text-purple-800' },
  { id: 'negotiation', label: 'Преговори', color: 'bg-orange-100 text-orange-800' },
  { id: 'won', label: 'Спечелен', color: 'bg-green-100 text-green-800' },
  { id: 'lost', label: 'Загубен', color: 'bg-red-100 text-red-800' },
];

const SOURCES = {
  'Онлайн': ['Уебсайт', 'Facebook', 'Google Ads', 'LinkedIn', 'Instagram'],
  'Офлайн': ['Телефон', 'Изложение', 'Директна среща', 'Пощенска кампания'],
  'Препоръка': ['Клиент', 'Партньор', 'Служител', 'Друго']
};

const REGIONS = ['София', 'Пловдив', 'Варна', 'Бургас', 'Русе', 'Стара Загора', 'Друг'];

// Helper: normalize lead from API response
const normalizeLead = (lead) => ({
  ...lead,
  assignedTo: lead.assigned_to ?? lead.assignedTo,
  source: lead.source_level1
    ? { level1: lead.source_level1, level2: lead.source_level2 }
    : lead.source || { level1: '', level2: '' },
  contact: lead.contact || {},
  company: lead.company || {},
  timeline: lead.timeline || [],
  files: lead.files || [],
  value: parseFloat(lead.value) || 0,
});

const CRMApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Login screen users list (just for display — we still use real auth)
  const LOGIN_USERS = [
    { id: 1, name: 'Админ', role: 'admin', email: 'admin@company.com' },
    { id: 2, name: 'Иван Петров', role: 'manager', email: 'ivan@company.com' },
    { id: 3, name: 'Мария Георгиева', role: 'sales', email: 'maria@company.com' },
    { id: 4, name: 'Георги Димитров', role: 'sales', email: 'georgi@company.com' },
    { id: 5, name: 'Елена Костова', role: 'sales', email: 'elena@company.com' },
  ];

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    const savedUser = localStorage.getItem('crm_user');
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setView('dashboard');
      } catch {
        localStorage.removeItem('crm_token');
        localStorage.removeItem('crm_user');
      }
    }
  }, []);

  // Load data when logged in
  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterType !== 'all') params.type = filterType;
      if (searchTerm) params.search = searchTerm;

      const [leadsRes, statsRes] = await Promise.all([
        api.getLeads(params),
        api.getStats(),
      ]);

      setLeads((leadsRes.leads || []).map(normalizeLead));
      setStats(statsRes.stats);
      setChartData(statsRes.charts);

      // Load users for admin/manager
      if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        const [usersRes, perfRes] = await Promise.all([
          api.getUsers(),
          api.getUserPerformance(),
        ]);
        setUsers(usersRes.users || []);
        // Merge performance into chart data
        setChartData(prev => ({
          ...prev,
          salesData: (perfRes.performance || []).map(p => ({
            name: p.name,
            leads: parseInt(p.total_leads) || 0,
            won: parseInt(p.won_leads) || 0,
            value: parseFloat(p.total_value) || 0,
          }))
        }));
      }
    } catch (err) {
      setError('Грешка при зареждане на данните: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, filterStatus, filterType, searchTerm]);

  useEffect(() => {
    if (view === 'dashboard' && currentUser) {
      loadData();
    }
  }, [view, currentUser, loadData]);

  const login = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, 'password123');
      localStorage.setItem('crm_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setView('dashboard');
    } catch (err) {
      setError('Грешка при вход: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    localStorage.removeItem('crm_user');
    setCurrentUser(null);
    setView('login');
    setSelectedLead(null);
    setLeads([]);
    setStats(null);
    setError(null);
  };

  const addLead = async (leadData) => {
    setLoading(true);
    setError(null);
    try {
      await api.createLead(leadData);
      setShowNewLeadForm(false);
      await loadData();
    } catch (err) {
      setError('Грешка при създаване на лийд: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await api.updateLeadStatus(leadId, newStatus);
      // Optimistic update
      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, status: newStatus } : l
      ));
      // Refresh selected lead
      if (selectedLead?.id === leadId) {
        const res = await api.getLead(leadId);
        setSelectedLead(normalizeLead(res.lead));
      }
      await loadData();
    } catch (err) {
      setError('Грешка при промяна на статус: ' + err.message);
    }
  };

  const addComment = async (leadId, comment) => {
    try {
      await api.addComment(leadId, comment);
      // Refresh lead detail
      const res = await api.getLead(leadId);
      const updated = normalizeLead(res.lead);
      setSelectedLead(updated);
      setLeads(prev => prev.map(l => l.id === leadId ? updated : l));
    } catch (err) {
      setError('Грешка при добавяне на коментар: ' + err.message);
    }
  };

  const addFile = async (leadId, fileName, fileType) => {
    try {
      await api.addFile(leadId, fileName, fileType);
      // Refresh lead detail
      const res = await api.getLead(leadId);
      const updated = normalizeLead(res.lead);
      setSelectedLead(updated);
      setLeads(prev => prev.map(l => l.id === leadId ? updated : l));
    } catch (err) {
      setError('Грешка при качване на файл: ' + err.message);
    }
  };

  const openLeadDetail = async (lead) => {
    setLoading(true);
    try {
      const res = await api.getLead(lead.id);
      setSelectedLead(normalizeLead(res.lead));
    } catch {
      setSelectedLead(lead);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!leads.length) return;
    const csvData = leads.map(lead => ({
      'Име': lead.name,
      'Тип': lead.type,
      'Статус': STATUSES.find(s => s.id === lead.status)?.label,
      'Регион': lead.region,
      'Стойност': lead.value || 0,
      'Email': lead.contact?.email || '',
      'Телефон': lead.contact?.phone || '',
    }));
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Login Screen
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">CRM System</h1>
            <p className="text-gray-600">Изберете потребител за вход</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            {LOGIN_USERS.map(user => (
              <button
                key={user.id}
                onClick={() => login(user.email)}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-indigo-700">{user.name}</div>
                    <div className="text-sm text-gray-500">
                      {user.role === 'admin' ? 'Администратор' : user.role === 'manager' ? 'Мениджър' : 'Търговец'}
                    </div>
                  </div>
                  {loading ? (
                    <Loader className="w-5 h-5 text-indigo-400 animate-spin" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${sidebarOpen ? 'w-64' : 'w-20'} 
        bg-indigo-900 text-white transition-all duration-300 flex flex-col
        fixed md:relative h-full z-50
      `}>
        <div className="p-4 flex items-center justify-between border-b border-indigo-800">
          {sidebarOpen && <h2 className="text-xl font-bold">CRM Pro</h2>}
          <button
            onClick={() => { setSidebarOpen(!sidebarOpen); setMobileMenuOpen(false); }}
            className="p-2 hover:bg-indigo-800 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => { setView('dashboard'); setSelectedLead(null); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-800' : 'hover:bg-indigo-800'}`}
          >
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => { setShowNewLeadForm(true); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition-colors"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Нов лийд</span>}
          </button>

          {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
            <button
              onClick={exportToCSV}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition-colors"
            >
              <Download className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Експорт CSV</span>}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{currentUser?.name}</div>
                <div className="text-xs text-indigo-300 capitalize">
                  {currentUser?.role === 'admin' ? 'Админ' : currentUser?.role === 'manager' ? 'Мениджър' : 'Търговец'}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-800 transition-colors text-indigo-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Изход</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  {selectedLead ? selectedLead.name : 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {selectedLead
                    ? `${selectedLead.type} • ${STATUSES.find(s => s.id === selectedLead.status)?.label}`
                    : `Добре дошли, ${currentUser?.name}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {loading && <Loader className="w-5 h-5 text-indigo-400 animate-spin" />}
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && !loading && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
            <button onClick={() => setError(null)} className="ml-2 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {!selectedLead ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Всички</span>
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats?.total ?? '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">лийдове</div>
                </div>

                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Активни</span>
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats?.active ?? '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">в процес</div>
                </div>

                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Спечелени</span>
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats?.won ?? '—'}</div>
                  <div className="text-xs text-green-600 mt-1">{stats?.conversionRate ?? 0}% конверсия</div>
                </div>

                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Обороти</span>
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-gray-800">
                    {stats ? `${((stats.wonValue || 0) / 1000).toFixed(0)}K` : '—'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    от {stats ? `${((stats.totalValue || 0) / 1000).toFixed(0)}K` : '—'} лв
                  </div>
                </div>
              </div>

              {/* Charts (Manager/Admin only) */}
              {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <ChartCard title="Разпределение по статус" data={chartData.statusData} type="funnel" />
                  {chartData.salesData && (
                    <ChartCard title="Performance по търговци" data={chartData.salesData} type="sales" />
                  )}
                </div>
              )}

              {/* Filters & Search */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Търси..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Всички статуси</option>
                    {STATUSES.map(status => (
                      <option key={status.id} value={status.id}>{status.label}</option>
                    ))}
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">Всички типове</option>
                    <option value="B2B">B2B</option>
                    <option value="B2C">B2C</option>
                  </select>
                </div>
              </div>

              {/* Loading state */}
              {loading && !leads.length && (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader className="w-8 h-8 animate-spin mr-3" />
                  <span>Зареждане...</span>
                </div>
              )}

              {/* Leads Table - Desktop */}
              {!loading || leads.length > 0 ? (
                <>
                  <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Лийд</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Тип</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Стойност</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Регион</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Назначен</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {leads.map(lead => {
                            const status = STATUSES.find(s => s.id === lead.status);
                            const assignedUser = users.find(u => u.id === lead.assignedTo);
                            return (
                              <tr
                                key={lead.id}
                                onClick={() => openLeadDetail(lead)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <td className="px-6 py-4">
                                  <div className="font-semibold text-gray-800">{lead.name}</div>
                                  <div className="text-sm text-gray-500">{lead.contact?.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {lead.type}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status?.color}`}>
                                    {status?.label}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                  {lead.value ? `${lead.value.toLocaleString()} лв` : '-'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{lead.region}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {assignedUser?.name || lead.assigned_to_name || '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {leads.length === 0 && !loading && (
                      <div className="text-center py-12 text-gray-500">
                        Няма намерени лийдове
                      </div>
                    )}
                  </div>

                  {/* Leads Cards - Mobile */}
                  <div className="md:hidden space-y-3">
                    {leads.map(lead => {
                      const status = STATUSES.find(s => s.id === lead.status);
                      return (
                        <div
                          key={lead.id}
                          onClick={() => openLeadDetail(lead)}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800">{lead.name}</h3>
                              <p className="text-sm text-gray-500">{lead.contact?.person}</p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                              {status?.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{lead.type}</span>
                            {lead.value > 0 && (
                              <span className="font-medium text-gray-800">{lead.value.toLocaleString()} лв</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <LeadDetail
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onStatusChange={updateLeadStatus}
              onAddComment={addComment}
              onAddFile={addFile}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>

      {/* New Lead Modal */}
      {showNewLeadForm && (
        <NewLeadForm
          onClose={() => setShowNewLeadForm(false)}
          onSubmit={addLead}
          currentUser={currentUser}
          users={users}
          loading={loading}
        />
      )}
    </div>
  );
};

// Chart Component
const ChartCard = ({ title, data, type }) => {
  if (type === 'funnel') {
    const maxValue = Math.max(...(data || []).map(d => d.count || 0), 1);
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {title}
        </h3>
        <div className="space-y-3">
          {(data || []).map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.status}</span>
                <span className="text-sm text-gray-600">{item.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${((item.count || 0) / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'sales') {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          {title}
        </h3>
        <div className="space-y-4">
          {(data || []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-500">{item.leads} лийдове • {item.won} спечелени</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{((item.value || 0) / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-500">лв</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

// Lead Detail Component
const LeadDetail = ({ lead, onClose, onStatusChange, onAddComment, onAddFile, currentUser }) => {
  const [comment, setComment] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('offer');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
const [fileDate, setFileDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    await onAddComment(lead.id, comment);
    setComment('');
    setSubmitting(false);
  };

const handleAddFile = async () => {
  if (!selectedFile) return;
  setSubmitting(true);
  try {
    await api.uploadFile(lead.id, selectedFile, fileType, fileDate);
    setSelectedFile(null);
    setFileDate(new Date().toISOString().split('T')[0]);
    setShowFileUpload(false);
    // Close detail and refresh page to show new file
    onClose();
    window.location.reload();
  } catch (err) {
    alert('Грешка при качване на файл: ' + err.message);
  } finally {
    setSubmitting(false);
  }
};

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'created': return <Plus className="w-4 h-4" />;
      case 'status_change': return <TrendingUp className="w-4 h-4" />;
      case 'comment': return <MessageSquare className="w-4 h-4" />;
      case 'assigned': return <Users className="w-4 h-4" />;
      case 'file': return <FileText className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };


  
  const getTimelineColor = (type) => {
    switch (type) {
      case 'created': return 'bg-blue-100 text-blue-600';
      case 'status_change': return 'bg-purple-100 text-purple-600';
      case 'comment': return 'bg-green-100 text-green-600';
      case 'assigned': return 'bg-orange-100 text-orange-600';
      case 'file': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const currentStatus = STATUSES.find(s => s.id === lead.status);

  // Normalize timeline - handle both user_name and user fields
  const timeline = (lead.timeline || []).map(e => ({
    ...e,
    user: e.user_name || e.user || 'Система',
    data: e.data || e.content || '',
    timestamp: e.created_at || e.timestamp,
  }));

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={onClose}
        className="mb-4 md:mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ChevronRight className="w-5 h-5 transform rotate-180" />
        <span className="hidden md:inline">Обратно към списъка</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">БЪРЗИ ДЕЙСТВИЯ</h3>
            <div className="space-y-2">
              <a href={`tel:${lead.contact?.phone}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm">{lead.contact?.phone}</span>
              </a>
              <a href={`mailto:${lead.contact?.email}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm truncate">{lead.contact?.email}</span>
              </a>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">СТАТУС</h3>
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg ${currentStatus?.color} font-medium text-sm md:text-base`}
              >
                <span>{currentStatus?.label}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {STATUSES.map(status => (
                    <button
                      key={status.id}
                      onClick={() => { onStatusChange(lead.id, status.id); setShowStatusDropdown(false); }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${status.id === lead.status ? 'bg-gray-50' : ''}`}
                    >
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Files */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600">ФАЙЛОВЕ</h3>
              <button onClick={() => setShowFileUpload(true)} className="p-1 hover:bg-gray-100 rounded">
                <Upload className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {showFileUpload && (
  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Избери файл (PDF или DOCX)
      </label>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
      />
    </div>
    
    <div className="mb-2">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Тип документ
      </label>
      <select
        value={fileType}
        onChange={(e) => setFileType(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
      >
        <option value="offer">Оферта</option>
        <option value="contract">Договор</option>
        <option value="other">Друго</option>
      </select>
    </div>
    
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Дата на документ
      </label>
      <input
        type="date"
        value={fileDate}
        onChange={(e) => setFileDate(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
      />
    </div>
    
    {selectedFile && (
      <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
        <strong>Избран:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
      </div>
    )}
    
    <div className="flex gap-2">
      <button
        onClick={handleAddFile}
        disabled={submitting || !selectedFile}
        className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Качване...' : 'Качи файл'}
      </button>
      <button
        onClick={() => { 
          setShowFileUpload(false); 
          setSelectedFile(null); 
          setFileDate(new Date().toISOString().split('T')[0]); 
        }}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
      >
        Отказ
      </button>
    </div>
  </div>
)}

            <div className="space-y-2">
              {lead.files && lead.files.length > 0 ? (
                lead.files.map(file => (
                  <div key={file.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                    <Paperclip className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{file.name || file.original_name}</div>
                      <div className="text-xs text-gray-500">
                        {file.uploadedBy || file.uploaded_by_name} • {new Date(file.uploadedAt || file.created_at).toLocaleDateString('bg-BG')}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Няма качени файлове</p>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">КОНТАКТ</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Лице за контакт</div>
                <div className="text-sm font-medium text-gray-800">{lead.contact?.person}</div>
              </div>
              {lead.value > 0 && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Стойност</div>
                  <div className="text-sm font-medium text-gray-800">{lead.value.toLocaleString()} лв</div>
                </div>
              )}
            </div>
          </div>

          {/* Company Info (B2B only) */}
          {lead.type === 'B2B' && lead.company && (lead.company.eik || lead.company.mol) && (
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">ФИРМЕНИ ДАННИ</h3>
              <div className="space-y-3">
                {lead.company.eik && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ЕИК</div>
                    <div className="text-sm font-medium text-gray-800">{lead.company.eik}</div>
                  </div>
                )}
                {lead.company.mol && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">МОЛ</div>
                    <div className="text-sm text-gray-800">{lead.company.mol}</div>
                  </div>
                )}
                {lead.company.address && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Адрес</div>
                    <div className="text-sm text-gray-800">{lead.company.address}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Source & Region */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">ИНФОРМАЦИЯ</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Тип</div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {lead.type}
                </span>
              </div>
              {lead.source && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Източник</div>
                  <div className="text-sm text-gray-800">{lead.source.level1} → {lead.source.level2}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-500 mb-1">Регион</div>
                <div className="text-sm text-gray-800">{lead.region}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
            </div>

            {/* Add Comment */}
            <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Добави коментар или бележка..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                rows="3"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={!comment.trim() || submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm md:text-base flex items-center gap-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  Добави коментар
                </button>
              </div>
            </div>

            {/* Timeline Events */}
            <div className="p-4 md:p-6 space-y-4 max-h-[400px] md:max-h-[600px] overflow-y-auto">
              {[...timeline].reverse().map((event, idx) => (
                <div key={event.id || idx} className="flex gap-3 md:gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTimelineColor(event.type)}`}>
                    {getTimelineIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm md:text-base">{event.user}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString('bg-BG', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{event.data}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// New Lead Form Component
const NewLeadForm = ({ onClose, onSubmit, currentUser, users, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'B2B',
    status: 'new',
    source: { level1: '', level2: '' },
    region: '',
    value: '',
    assignedTo: null,
    contact: { phone: '', email: '', person: '' },
    company: { eik: '', mol: '', address: '' }
  });

  const [sourceLevel2Options, setSourceLevel2Options] = useState([]);

  const handleSourceLevel1Change = (value) => {
    setFormData({ ...formData, source: { level1: value, level2: '' } });
    setSourceLevel2Options(SOURCES[value] || []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let assignedTo = formData.assignedTo;
    if (!assignedTo && currentUser.role !== 'admin') {
      assignedTo = currentUser.id;
    } else if (!assignedTo && users.length > 0) {
      const regionalSales = users.find(u => u.role === 'sales' && u.region === formData.region);
      assignedTo = regionalSales?.id || users.find(u => u.role === 'sales')?.id;
    }
    onSubmit({
      name: formData.name,
      type: formData.type,
      status: formData.status,
      source: { level1: formData.source.level1, level2: formData.source.level2 },
      region: formData.region,
      value: parseInt(formData.value) || 0,
      assignedTo,
      contact: formData.contact,
      company: formData.company,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Нов лийд</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Основна информация</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Име на лийд *</label>
              <input
                type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Име на фирма или лице"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип *</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Регион *</label>
                <select required value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Избери</option>
                  {REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Стойност (лв)</label>
                <input type="number" value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0" />
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Източник</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
                <select required value={formData.source.level1} onChange={(e) => handleSourceLevel1Change(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                  <option value="">Избери</option>
                  {Object.keys(SOURCES).map(source => <option key={source} value={source}>{source}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подкатегория *</label>
                <select required value={formData.source.level2}
                  onChange={(e) => setFormData({ ...formData, source: { ...formData.source, level2: e.target.value } })}
                  disabled={!formData.source.level1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100">
                  <option value="">Избери</option>
                  {sourceLevel2Options.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Контактна информация</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Лице за контакт *</label>
              <input type="text" required value={formData.contact.person}
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, person: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={formData.contact.email}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                <input type="tel" required value={formData.contact.phone}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          {/* Company Info (B2B only) */}
          {formData.type === 'B2B' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700">Фирмени данни</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ЕИК</label>
                  <input type="text" value={formData.company.eik}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, eik: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">МОЛ</label>
                  <input type="text" value={formData.company.mol}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, mol: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                <input type="text" value={formData.company.address}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, address: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Отказ
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Създай лийд
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CRMApp;

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Plus, Search, Filter, TrendingUp, Clock, FileText, MessageSquare, 
  ChevronDown, ChevronRight, Upload, Download, X, Menu, Bell, Settings, LogOut, User,
  Phone, Mail, Paperclip, Trash2, Edit, Check, BarChart3, PieChart, Activity,
  ArrowUpRight, ArrowDownRight, DollarSign, Target
} from 'lucide-react';

// Богати инициални данни
const INITIAL_DATA = {
  users: [
    { id: 1, name: 'Админ', role: 'admin', email: 'admin@company.com', region: 'Всички' },
    { id: 2, name: 'Иван Петров', role: 'manager', email: 'ivan@company.com', region: 'София' },
    { id: 3, name: 'Мария Георгиева', role: 'sales', email: 'maria@company.com', region: 'Пловдив' },
    { id: 4, name: 'Георги Димитров', role: 'sales', email: 'georgi@company.com', region: 'Варна' },
    { id: 5, name: 'Елена Костова', role: 'sales', email: 'elena@company.com', region: 'София' },
  ],
  leads: [
    {
      id: 1,
      name: 'Софтех ЕООД',
      type: 'B2B',
      status: 'won',
      source: { level1: 'Онлайн', level2: 'Уебсайт' },
      region: 'София',
      assignedTo: 5,
      createdAt: '2026-01-15T10:30:00',
      value: 25000,
      contact: { phone: '0888123456', email: 'contact@softech.bg', person: 'Петър Иванов' },
      company: { eik: '123456789', mol: 'Петър Иванов', address: 'София, ул. Витоша 1' },
      files: [
        { id: 1, name: 'Оферта_Софтех_2026.pdf', type: 'offer', uploadedBy: 'Елена Костова', uploadedAt: '2026-01-20T14:30:00' },
        { id: 2, name: 'Договор_Софтех_signed.pdf', type: 'contract', uploadedBy: 'Елена Костова', uploadedAt: '2026-02-01T11:20:00' }
      ],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-01-15T10:30:00', data: 'Лийд създаден' },
        { id: 2, type: 'assigned', user: 'Админ', timestamp: '2026-01-15T10:35:00', data: 'Назначен на Елена Костова' },
        { id: 3, type: 'status_change', user: 'Елена Костова', timestamp: '2026-01-16T09:15:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 4, type: 'comment', user: 'Елена Костова', timestamp: '2026-01-16T09:20:00', data: 'Първи разговор - интересуват се от автоматизация на бизнес процеси. Уговорена среща за 18.01.' },
        { id: 5, type: 'comment', user: 'Елена Костова', timestamp: '2026-01-18T15:30:00', data: 'Проведена среща в офиса на клиента. Обсъдени нужди, @Иван Петров може да помогне с техническите детайли.' },
        { id: 6, type: 'status_change', user: 'Елена Костова', timestamp: '2026-01-19T10:00:00', data: 'Статус променен от "Контактуван" на "Оферта изпратена"' },
        { id: 7, type: 'file', user: 'Елена Костова', timestamp: '2026-01-20T14:30:00', data: 'Качен файл: Оферта_Софтех_2026.pdf' },
        { id: 8, type: 'comment', user: 'Иван Петров', timestamp: '2026-01-22T11:00:00', data: 'Получена обратна връзка - харесват предложението, искат малка корекция в цената.' },
        { id: 9, type: 'status_change', user: 'Елена Костова', timestamp: '2026-01-25T14:00:00', data: 'Статус променен от "Оферта изпратена" на "Преговори"' },
        { id: 10, type: 'comment', user: 'Елена Костова', timestamp: '2026-01-28T16:00:00', data: 'Постигнахме споразумение! Стойност 25,000 лв. Изпращам договор.' },
        { id: 11, type: 'file', user: 'Елена Костова', timestamp: '2026-02-01T11:20:00', data: 'Качен файл: Договор_Софтех_signed.pdf' },
        { id: 12, type: 'status_change', user: 'Елена Костова', timestamp: '2026-02-01T11:25:00', data: 'Статус променен от "Преговори" на "Спечелен"' },
      ]
    },
    {
      id: 2,
      name: 'Мега Маркет АД',
      type: 'B2B',
      status: 'offer_sent',
      source: { level1: 'Препоръка', level2: 'Клиент' },
      region: 'Пловдив',
      assignedTo: 3,
      createdAt: '2026-02-01T09:00:00',
      value: 18000,
      contact: { phone: '0877111222', email: 'sales@megamarket.bg', person: 'Стефан Димов' },
      company: { eik: '987654321', mol: 'Стефан Димов', address: 'Пловдив, бул. Руски 45' },
      files: [
        { id: 3, name: 'Оферта_МегаМаркет_v2.pdf', type: 'offer', uploadedBy: 'Мария Георгиева', uploadedAt: '2026-02-10T10:15:00' }
      ],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-02-01T09:00:00', data: 'Лийд създаден' },
        { id: 2, type: 'assigned', user: 'Админ', timestamp: '2026-02-01T09:05:00', data: 'Назначен на Мария Георгиева' },
        { id: 3, type: 'comment', user: 'Мария Георгиева', timestamp: '2026-02-01T11:00:00', data: 'Препоръчан от Софтех ЕООД. Търсят подобно решение.' },
        { id: 4, type: 'status_change', user: 'Мария Георгиева', timestamp: '2026-02-03T14:00:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 5, type: 'comment', user: 'Мария Георгиева', timestamp: '2026-02-05T16:30:00', data: 'Телефонен разговор - искат оферта до края на седмицата.' },
        { id: 6, type: 'file', user: 'Мария Георгиева', timestamp: '2026-02-10T10:15:00', data: 'Качен файл: Оферта_МегаМаркет_v2.pdf' },
        { id: 7, type: 'status_change', user: 'Мария Георгиева', timestamp: '2026-02-10T10:20:00', data: 'Статус променен от "Контактуван" на "Оферта изпратена"' },
        { id: 8, type: 'comment', user: 'Мария Георгиева', timestamp: '2026-02-14T09:00:00', data: 'Проследяване - чакаме отговор до края на седмицата.' },
      ]
    },
    {
      id: 3,
      name: 'Иван Стоянов',
      type: 'B2C',
      status: 'contacted',
      source: { level1: 'Онлайн', level2: 'Facebook' },
      region: 'Пловдив',
      assignedTo: 3,
      createdAt: '2026-02-12T14:20:00',
      value: 3500,
      contact: { phone: '0877654321', email: 'ivan.st@gmail.com', person: 'Иван Стоянов' },
      files: [],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-02-12T14:20:00', data: 'Лийд създаден' },
        { id: 2, type: 'assigned', user: 'Админ', timestamp: '2026-02-12T14:25:00', data: 'Назначен на Мария Георгиева' },
        { id: 3, type: 'status_change', user: 'Мария Георгиева', timestamp: '2026-02-13T09:15:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 4, type: 'comment', user: 'Мария Георгиева', timestamp: '2026-02-13T09:20:00', data: 'Обадих се, интересува се от продукт А. Уговорена среща за утре.' },
      ]
    },
    {
      id: 4,
      name: 'Техно Град ООД',
      type: 'B2B',
      status: 'negotiation',
      source: { level1: 'Офлайн', level2: 'Изложение' },
      region: 'Варна',
      assignedTo: 4,
      createdAt: '2026-01-28T11:00:00',
      value: 32000,
      contact: { phone: '0888999888', email: 'office@tehnograd.bg', person: 'Красимира Петкова' },
      company: { eik: '456789123', mol: 'Красимира Петкова', address: 'Варна, ул. Сливница 12' },
      files: [
        { id: 4, name: 'Оферта_ТехноГрад.pdf', type: 'offer', uploadedBy: 'Георги Димитров', uploadedAt: '2026-02-05T15:00:00' }
      ],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-01-28T11:00:00', data: 'Лийд създаден' },
        { id: 2, type: 'comment', user: 'Георги Димитров', timestamp: '2026-01-28T11:10:00', data: 'Запознати на изложение Tech Expo. Много заинтересовани.' },
        { id: 3, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-01-30T10:00:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 4, type: 'file', user: 'Георги Димитров', timestamp: '2026-02-05T15:00:00', data: 'Качен файл: Оферта_ТехноГрад.pdf' },
        { id: 5, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-02-05T15:05:00', data: 'Статус променен от "Контактуван" на "Оферта изпратена"' },
        { id: 6, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-02-12T14:00:00', data: 'Статус променен от "Оферта изпратена" на "Преговори"' },
        { id: 7, type: 'comment', user: 'Георги Димитров', timestamp: '2026-02-12T14:05:00', data: 'Активни преговори за крайната цена. Очакваме решение до края на месеца.' },
      ]
    },
    {
      id: 5,
      name: 'Елена Василева',
      type: 'B2C',
      status: 'new',
      source: { level1: 'Онлайн', level2: 'Google Ads' },
      region: 'София',
      assignedTo: 5,
      createdAt: '2026-02-15T16:45:00',
      value: 2800,
      contact: { phone: '0899777666', email: 'e.vasileva@gmail.com', person: 'Елена Василева' },
      files: [],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-02-15T16:45:00', data: 'Лийд създаден' },
        { id: 2, type: 'assigned', user: 'Система', timestamp: '2026-02-15T16:45:00', data: 'Автоматично назначен на Елена Костова (регион: София)' },
      ]
    },
    {
      id: 6,
      name: 'БизнесПро ЕООД',
      type: 'B2B',
      status: 'contacted',
      source: { level1: 'Онлайн', level2: 'LinkedIn' },
      region: 'София',
      assignedTo: 5,
      createdAt: '2026-02-10T10:20:00',
      value: 15000,
      contact: { phone: '0888555444', email: 'info@biznespro.bg', person: 'Николай Георгиев' },
      company: { eik: '789123456', mol: 'Николай Георгиев', address: 'София, бул. Цариградско шосе 115' },
      files: [],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-02-10T10:20:00', data: 'Лийд създаден' },
        { id: 2, type: 'assigned', user: 'Система', timestamp: '2026-02-10T10:20:00', data: 'Автоматично назначен на Елена Костова' },
        { id: 3, type: 'status_change', user: 'Елена Костова', timestamp: '2026-02-11T09:30:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 4, type: 'comment', user: 'Елена Костова', timestamp: '2026-02-11T09:35:00', data: 'Първи контакт по email. Изпратих презентация на услугите.' },
      ]
    },
    {
      id: 7,
      name: 'Мартин Колев',
      type: 'B2C',
      status: 'lost',
      source: { level1: 'Офлайн', level2: 'Телефон' },
      region: 'Варна',
      assignedTo: 4,
      createdAt: '2026-01-20T14:00:00',
      value: 4200,
      contact: { phone: '0877333222', email: 'm.kolev@abv.bg', person: 'Мартин Колев' },
      files: [],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-01-20T14:00:00', data: 'Лийд създаден' },
        { id: 2, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-01-21T10:00:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 3, type: 'comment', user: 'Георги Димитров', timestamp: '2026-01-25T15:00:00', data: 'Няколко разговора - цената е твърде висока за него.' },
        { id: 4, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-02-05T11:00:00', data: 'Статус променен от "Контактуван" на "Загубен"' },
        { id: 5, type: 'comment', user: 'Георги Димитров', timestamp: '2026-02-05T11:05:00', data: 'Клиентът избра конкурент с по-ниска цена.' },
      ]
    },
    {
      id: 8,
      name: 'ДигиталМаркет ООД',
      type: 'B2B',
      status: 'new',
      source: { level1: 'Препоръка', level2: 'Партньор' },
      region: 'Пловдив',
      assignedTo: 3,
      createdAt: '2026-02-14T09:30:00',
      value: 21000,
      contact: { phone: '0888444555', email: 'contact@digitalmarket.bg', person: 'Десислава Иванова' },
      company: { eik: '321654987', mol: 'Десислава Иванова', address: 'Пловдив, ул. Марица 22' },
      files: [],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-02-14T09:30:00', data: 'Лийд създаден' },
        { id: 2, type: 'comment', user: 'Мария Георгиева', timestamp: '2026-02-14T09:35:00', data: 'Препоръчани от наш партньор. Планирам обаждане утре.' },
      ]
    },
    {
      id: 9,
      name: 'Александра Тодорова',
      type: 'B2C',
      status: 'offer_sent',
      source: { level1: 'Онлайн', level2: 'Instagram' },
      region: 'София',
      assignedTo: 5,
      createdAt: '2026-02-08T11:15:00',
      value: 5600,
      contact: { phone: '0899888777', email: 'alex.todorova@gmail.com', person: 'Александра Тодорова' },
      files: [
        { id: 5, name: 'Оферта_Тодорова.pdf', type: 'offer', uploadedBy: 'Елена Костова', uploadedAt: '2026-02-12T14:00:00' }
      ],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-02-08T11:15:00', data: 'Лийд създаден' },
        { id: 2, type: 'status_change', user: 'Елена Костова', timestamp: '2026-02-09T10:00:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 3, type: 'comment', user: 'Елена Костова', timestamp: '2026-02-09T10:05:00', data: 'Запитване от Instagram. Интересува се от пакет Premium.' },
        { id: 4, type: 'file', user: 'Елена Костова', timestamp: '2026-02-12T14:00:00', data: 'Качен файл: Оферта_Тодорова.pdf' },
        { id: 5, type: 'status_change', user: 'Елена Костова', timestamp: '2026-02-12T14:05:00', data: 'Статус променен от "Контактуван" на "Оферта изпратена"' },
      ]
    },
    {
      id: 10,
      name: 'ТехноСофт АД',
      type: 'B2B',
      status: 'won',
      source: { level1: 'Офлайн', level2: 'Директна среща' },
      region: 'Варна',
      assignedTo: 4,
      createdAt: '2026-01-10T09:00:00',
      value: 45000,
      contact: { phone: '0888111222', email: 'sales@tehnosoft.bg', person: 'Валентин Петров' },
      company: { eik: '147258369', mol: 'Валентин Петров', address: 'Варна, бул. Владислав Варненчик 89' },
      files: [
        { id: 6, name: 'Договор_ТехноСофт_final.pdf', type: 'contract', uploadedBy: 'Георги Димитров', uploadedAt: '2026-01-30T16:00:00' }
      ],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-01-10T09:00:00', data: 'Лийд създаден' },
        { id: 2, type: 'comment', user: 'Георги Димитров', timestamp: '2026-01-10T09:10:00', data: 'Среща в нашия офис. Големи амбиции за дигитализация.' },
        { id: 3, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-01-12T10:00:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 4, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-01-18T11:00:00', data: 'Статус променен от "Контактуван" на "Оферта изпратена"' },
        { id: 5, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-01-25T14:00:00', data: 'Статус променен от "Оферта изпратена" на "Преговори"' },
        { id: 6, type: 'comment', user: 'Георги Димитров', timestamp: '2026-01-28T15:00:00', data: 'Отлични преговори! Постигнахме споразумение за 45,000 лв.' },
        { id: 7, type: 'file', user: 'Георги Димитров', timestamp: '2026-01-30T16:00:00', data: 'Качен файл: Договор_ТехноСофт_final.pdf' },
        { id: 8, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-01-30T16:05:00', data: 'Статус променен от "Преговори" на "Спечелен"' },
      ]
    },
    {
      id: 11,
      name: 'Георги Симеонов',
      type: 'B2C',
      status: 'contacted',
      source: { level1: 'Препоръка', level2: 'Клиент' },
      region: 'Пловдив',
      assignedTo: 3,
      createdAt: '2026-02-13T10:00:00',
      value: 3200,
      contact: { phone: '0877222333', email: 'g.simeonov@mail.bg', person: 'Георги Симеонов' },
      files: [],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-02-13T10:00:00', data: 'Лийд създаден' },
        { id: 2, type: 'comment', user: 'Мария Георгиева', timestamp: '2026-02-13T10:05:00', data: 'Препоръчан от Иван Стоянов. Търси подобно решение.' },
        { id: 3, type: 'status_change', user: 'Мария Георгиева', timestamp: '2026-02-14T11:00:00', data: 'Статус променен от "Нов" на "Контактуван"' },
      ]
    },
    {
      id: 12,
      name: 'ИноваГрупа ЕООД',
      type: 'B2B',
      status: 'contacted',
      source: { level1: 'Онлайн', level2: 'Уебсайт' },
      region: 'Бургас',
      assignedTo: 4,
      createdAt: '2026-02-11T15:30:00',
      value: 19500,
      contact: { phone: '0888666777', email: 'office@inovagroup.bg', person: 'Пламен Христов' },
      company: { eik: '963852741', mol: 'Пламен Христов', address: 'Бургас, ул. Александровска 56' },
      files: [],
      timeline: [
        { id: 1, type: 'created', user: 'Система', timestamp: '2026-02-11T15:30:00', data: 'Лийд създаден' },
        { id: 2, type: 'assigned', user: 'Система', timestamp: '2026-02-11T15:30:00', data: 'Автоматично назначен на Георги Димитров (най-малко натоварен в региона)' },
        { id: 3, type: 'status_change', user: 'Георги Димитров', timestamp: '2026-02-12T09:00:00', data: 'Статус променен от "Нов" на "Контактуван"' },
        { id: 4, type: 'comment', user: 'Георги Димитров', timestamp: '2026-02-12T09:10:00', data: 'Добър първи разговор. Планират разширяване и имат нужда от системи.' },
      ]
    },
  ]
};

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

const CRMApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(INITIAL_DATA);
  const [view, setView] = useState('login');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crm-data-enhanced');
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('crm-data-enhanced', JSON.stringify(data));
  }, [data]);

  const login = (userId) => {
    const user = data.users.find(u => u.id === userId);
    setCurrentUser(user);
    setView('dashboard');
  };

  const logout = () => {
    setCurrentUser(null);
    setView('login');
    setSelectedLead(null);
  };

  const addLead = (leadData) => {
    const newLead = {
      ...leadData,
      id: data.leads.length + 1,
      createdAt: new Date().toISOString(),
      files: [],
      timeline: [
        {
          id: 1,
          type: 'created',
          user: currentUser.name,
          timestamp: new Date().toISOString(),
          data: 'Лийд създаден'
        }
      ]
    };
    setData({ ...data, leads: [...data.leads, newLead] });
    setShowNewLeadForm(false);
  };

  const updateLeadStatus = (leadId, newStatus) => {
    const statusLabel = STATUSES.find(s => s.id === newStatus)?.label;
    const oldStatus = data.leads.find(l => l.id === leadId)?.status;
    const oldStatusLabel = STATUSES.find(s => s.id === oldStatus)?.label;

    setData({
      ...data,
      leads: data.leads.map(lead =>
        lead.id === leadId
          ? {
              ...lead,
              status: newStatus,
              timeline: [
                ...lead.timeline,
                {
                  id: lead.timeline.length + 1,
                  type: 'status_change',
                  user: currentUser.name,
                  timestamp: new Date().toISOString(),
                  data: `Статус променен от "${oldStatusLabel}" на "${statusLabel}"`
                }
              ]
            }
          : lead
      )
    });

    if (selectedLead?.id === leadId) {
      const updated = data.leads.find(l => l.id === leadId);
      setSelectedLead({
        ...updated,
        status: newStatus,
        timeline: [
          ...updated.timeline,
          {
            id: updated.timeline.length + 1,
            type: 'status_change',
            user: currentUser.name,
            timestamp: new Date().toISOString(),
            data: `Статус променен от "${oldStatusLabel}" на "${statusLabel}"`
          }
        ]
      });
    }
  };

  const addComment = (leadId, comment) => {
    setData({
      ...data,
      leads: data.leads.map(lead =>
        lead.id === leadId
          ? {
              ...lead,
              timeline: [
                ...lead.timeline,
                {
                  id: lead.timeline.length + 1,
                  type: 'comment',
                  user: currentUser.name,
                  timestamp: new Date().toISOString(),
                  data: comment
                }
              ]
            }
          : lead
      )
    });

    if (selectedLead?.id === leadId) {
      setSelectedLead({
        ...selectedLead,
        timeline: [
          ...selectedLead.timeline,
          {
            id: selectedLead.timeline.length + 1,
            type: 'comment',
            user: currentUser.name,
            timestamp: new Date().toISOString(),
            data: comment
          }
        ]
      });
    }
  };

  const addFile = (leadId, fileName, fileType) => {
    const newFile = {
      id: Math.max(0, ...data.leads.flatMap(l => l.files || []).map(f => f.id)) + 1,
      name: fileName,
      type: fileType,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString()
    };

    setData({
      ...data,
      leads: data.leads.map(lead =>
        lead.id === leadId
          ? {
              ...lead,
              files: [...(lead.files || []), newFile],
              timeline: [
                ...lead.timeline,
                {
                  id: lead.timeline.length + 1,
                  type: 'file',
                  user: currentUser.name,
                  timestamp: new Date().toISOString(),
                  data: `Качен файл: ${fileName}`
                }
              ]
            }
          : lead
      )
    });

    if (selectedLead?.id === leadId) {
      setSelectedLead({
        ...selectedLead,
        files: [...(selectedLead.files || []), newFile],
        timeline: [
          ...selectedLead.timeline,
          {
            id: selectedLead.timeline.length + 1,
            type: 'file',
            user: currentUser.name,
            timestamp: new Date().toISOString(),
            data: `Качен файл: ${fileName}`
          }
        ]
      });
    }
  };

  const exportToCSV = () => {
    const csvData = filteredLeads.map(lead => ({
      'Име': lead.name,
      'Тип': lead.type,
      'Статус': STATUSES.find(s => s.id === lead.status)?.label,
      'Източник': `${lead.source.level1} - ${lead.source.level2}`,
      'Регион': lead.region,
      'Стойност': lead.value || 0,
      'Email': lead.contact.email,
      'Телефон': lead.contact.phone,
      'Създаден': new Date(lead.createdAt).toLocaleDateString('bg-BG')
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

  const filteredLeads = data.leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.contact?.phone?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesType = filterType === 'all' || lead.type === filterType;
    const matchesRole = currentUser?.role === 'admin' || currentUser?.role === 'manager' || lead.assignedTo === currentUser?.id;
    
    return matchesSearch && matchesStatus && matchesType && matchesRole;
  });

  const getStats = () => {
    const userLeads = currentUser?.role === 'admin' || currentUser?.role === 'manager' 
      ? data.leads 
      : data.leads.filter(l => l.assignedTo === currentUser?.id);
    
    const totalValue = userLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
    const wonValue = userLeads.filter(l => l.status === 'won').reduce((sum, lead) => sum + (lead.value || 0), 0);
    
    return {
      total: userLeads.length,
      new: userLeads.filter(l => l.status === 'new').length,
      won: userLeads.filter(l => l.status === 'won').length,
      active: userLeads.filter(l => !['won', 'lost'].includes(l.status)).length,
      totalValue,
      wonValue,
      conversionRate: userLeads.length > 0 ? Math.round((userLeads.filter(l => l.status === 'won').length / userLeads.length) * 100) : 0
    };
  };

  const getChartData = () => {
    const userLeads = currentUser?.role === 'admin' || currentUser?.role === 'manager' 
      ? data.leads 
      : data.leads.filter(l => l.assignedTo === currentUser?.id);

    // Status distribution
    const statusData = STATUSES.map(status => ({
      status: status.label,
      count: userLeads.filter(l => l.status === status.id).length,
      value: userLeads.filter(l => l.status === status.id).reduce((sum, l) => sum + (l.value || 0), 0)
    }));

    // B2B vs B2C
    const typeData = [
      { type: 'B2B', count: userLeads.filter(l => l.type === 'B2B').length },
      { type: 'B2C', count: userLeads.filter(l => l.type === 'B2C').length }
    ];

    // Performance by sales rep
    const salesData = data.users
      .filter(u => u.role === 'sales')
      .map(user => ({
        name: user.name,
        leads: data.leads.filter(l => l.assignedTo === user.id).length,
        won: data.leads.filter(l => l.assignedTo === user.id && l.status === 'won').length,
        value: data.leads.filter(l => l.assignedTo === user.id && l.status === 'won').reduce((sum, l) => sum + (l.value || 0), 0)
      }));

    return { statusData, typeData, salesData };
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
          
          <div className="space-y-3">
            {data.users.map(user => (
              <button
                key={user.id}
                onClick={() => login(user.id)}
                className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800 group-hover:text-indigo-700">{user.name}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {user.role === 'admin' ? 'Администратор' : user.role === 'manager' ? 'Мениджър' : 'Търговец'}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const chartData = getChartData();

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
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              setMobileMenuOpen(false);
            }} 
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
              onClick={() => exportToCSV()}
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
                  {selectedLead ? `${selectedLead.type} • ${STATUSES.find(s => s.id === selectedLead.status)?.label}` : `Добре дошли, ${currentUser?.name}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

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
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.total}</div>
                  <div className="text-xs text-gray-500 mt-1">лийдове</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Активни</span>
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.active}</div>
                  <div className="text-xs text-gray-500 mt-1">в процес</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Спечелени</span>
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800">{stats.won}</div>
                  <div className="text-xs text-green-600 mt-1">{stats.conversionRate}% конверсия</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-xs md:text-sm">Обороти</span>
                    <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                  </div>
                  <div className="text-xl md:text-2xl font-bold text-gray-800">
                    {(stats.wonValue / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-500 mt-1">от {(stats.totalValue / 1000).toFixed(0)}K лв</div>
                </div>
              </div>

              {/* Charts (Manager/Admin only) */}
              {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <ChartCard title="Разпределение по статус" data={chartData.statusData} type="funnel" />
                  <ChartCard title="Performance по търговци" data={chartData.salesData} type="sales" />
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

              {/* Leads Table - Desktop */}
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
                      {filteredLeads.map(lead => {
                        const assignedUser = data.users.find(u => u.id === lead.assignedTo);
                        const status = STATUSES.find(s => s.id === lead.status);
                        
                        return (
                          <tr
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-800">{lead.name}</div>
                              <div className="text-sm text-gray-500">{lead.contact.email}</div>
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
                            <td className="px-6 py-4 text-sm text-gray-600">{assignedUser?.name}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {filteredLeads.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Няма намерени лийдове
                  </div>
                )}
              </div>

              {/* Leads Cards - Mobile */}
              <div className="md:hidden space-y-3">
                {filteredLeads.map(lead => {
                  const status = STATUSES.find(s => s.id === lead.status);
                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{lead.name}</h3>
                          <p className="text-sm text-gray-500">{lead.contact.person}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status?.color}`}>
                          {status?.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{lead.type}</span>
                        {lead.value && (
                          <span className="font-medium text-gray-800">{lead.value.toLocaleString()} лв</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
          users={data.users}
        />
      )}
    </div>
  );
};

// Chart Component
const ChartCard = ({ title, data, type }) => {
  if (type === 'funnel') {
    const maxValue = Math.max(...data.map(d => d.count));
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {title}
        </h3>
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{item.status}</span>
                <span className="text-sm text-gray-600">{item.count} ({item.value.toLocaleString()} лв)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${(item.count / maxValue) * 100}%` }}
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
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-500">{item.leads} лийдове • {item.won} спечелени</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{(item.value / 1000).toFixed(0)}K</div>
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

  const handleAddComment = () => {
    if (comment.trim()) {
      onAddComment(lead.id, comment);
      setComment('');
    }
  };

  const handleAddFile = () => {
    if (fileName.trim()) {
      onAddFile(lead.id, fileName, fileType);
      setFileName('');
      setShowFileUpload(false);
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
        {/* Left Column - Info */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">БЪРЗИ ДЕЙСТВИЯ</h3>
            <div className="space-y-2">
              <a
                href={`tel:${lead.contact.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm">{lead.contact.phone}</span>
              </a>
              <a
                href={`mailto:${lead.contact.email}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-sm truncate">{lead.contact.email}</span>
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
                      onClick={() => {
                        onStatusChange(lead.id, status.id);
                        setShowStatusDropdown(false);
                      }}
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
              <button
                onClick={() => setShowFileUpload(true)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Upload className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {showFileUpload && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  placeholder="Име на файл..."
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                />
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                >
                  <option value="offer">Оферта</option>
                  <option value="contract">Договор</option>
                  <option value="other">Друго</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddFile}
                    className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                  >
                    Качи
                  </button>
                  <button
                    onClick={() => { setShowFileUpload(false); setFileName(''); }}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
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
                      <div className="text-sm font-medium text-gray-800 truncate">{file.name}</div>
                      <div className="text-xs text-gray-500">
                        {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString('bg-BG')}
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
                <div className="text-sm font-medium text-gray-800">{lead.contact.person}</div>
              </div>
              {lead.value && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Стойност</div>
                  <div className="text-sm font-medium text-gray-800">{lead.value.toLocaleString()} лв</div>
                </div>
              )}
            </div>
          </div>

          {/* Company Info (B2B only) */}
          {lead.type === 'B2B' && lead.company && (
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 mb-4">ФИРМЕНИ ДАННИ</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">ЕИК</div>
                  <div className="text-sm font-medium text-gray-800">{lead.company.eik}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">МОЛ</div>
                  <div className="text-sm text-gray-800">{lead.company.mol}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Адрес</div>
                  <div className="text-sm text-gray-800">{lead.company.address}</div>
                </div>
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
              <div>
                <div className="text-xs text-gray-500 mb-1">Източник</div>
                <div className="text-sm text-gray-800">{lead.source.level1} → {lead.source.level2}</div>
              </div>
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
                  disabled={!comment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                >
                  Добави коментар
                </button>
              </div>
            </div>

            {/* Timeline Events */}
            <div className="p-4 md:p-6 space-y-4 max-h-[400px] md:max-h-[600px] overflow-y-auto">
              {[...lead.timeline].reverse().map((event) => (
                <div key={event.id} className="flex gap-3 md:gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTimelineColor(event.type)}`}>
                    {getTimelineIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 md:gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm md:text-base">{event.user}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString('bg-BG', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
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

// New Lead Form Component (same as before, keeping it compact)
const NewLeadForm = ({ onClose, onSubmit, currentUser, users }) => {
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
    setFormData({
      ...formData,
      source: { level1: value, level2: '' }
    });
    setSourceLevel2Options(SOURCES[value] || []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let assignedTo = formData.assignedTo;
    if (!assignedTo && currentUser.role !== 'admin') {
      assignedTo = currentUser.id;
    } else if (!assignedTo && currentUser.role === 'admin') {
      const regionalSales = users.find(u => u.role === 'sales' && u.region === formData.region);
      assignedTo = regionalSales?.id || users.find(u => u.role === 'sales')?.id;
    }

    onSubmit({ ...formData, assignedTo, value: parseInt(formData.value) || 0 });
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
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Име на фирма или лице"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="B2B">B2B</option>
                  <option value="B2C">B2C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Регион *</label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Избери</option>
                  {REGIONS.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Стойност (лв)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Източник</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
                <select
                  required
                  value={formData.source.level1}
                  onChange={(e) => handleSourceLevel1Change(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Избери</option>
                  {Object.keys(SOURCES).map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подкатегория *</label>
                <select
                  required
                  value={formData.source.level2}
                  onChange={(e) => setFormData({ ...formData, source: { ...formData.source, level2: e.target.value } })}
                  disabled={!formData.source.level1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Избери</option>
                  {sourceLevel2Options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Контактна информация</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Лице за контакт *</label>
              <input
                type="text"
                required
                value={formData.contact.person}
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, person: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.contact.email}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                <input
                  type="tel"
                  required
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
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
                  <input
                    type="text"
                    value={formData.company.eik}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, eik: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">МОЛ</label>
                  <input
                    type="text"
                    value={formData.company.mol}
                    onChange={(e) => setFormData({ ...formData, company: { ...formData.company, mol: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                <input
                  type="text"
                  value={formData.company.address}
                  onChange={(e) => setFormData({ ...formData, company: { ...formData.company, address: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Отказ
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Създай лийд
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CRMApp;

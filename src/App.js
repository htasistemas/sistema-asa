/**
 * SISTEMA DE GESTÃO ASA (Ação Solidária Adventista)
 * =================================================
 * Versão: 4.5 (Tela de Login Premium & Moderna)
 * Tecnologias: React, Tailwind CSS, Lucide Icons.
 */

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { 
  ShieldCheck, LayoutDashboard, Building2, Users, LogOut, Plus, Trash2, Search, Map as MapIcon, 
  AlertTriangle, Menu, X, ChevronDown, ChevronRight, ChevronLeft, Phone, Mail, MapPin, Edit, CheckCircle, 
  Clock, Database, Download, Upload, RefreshCw, Cloud, Check, Calendar, AlertOctagon, 
  ExternalLink, FileSpreadsheet, Locate, HeartHandshake, FileText, Award, Layers, DollarSign,
  Star, Medal, Trophy, Lock, User, Target
} from 'lucide-react';

/* ===================================================================
   1. ESTILOS DE EMERGÊNCIA E TIPOGRAFIA
   ===================================================================
*/
const TailwindInjector = () => {
  useLayoutEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
         if (window.tailwind) {
            window.tailwind.config = {
              theme: { 
                extend: { 
                  fontFamily: { sans: ['Inter', 'sans-serif'] },
                  colors: { 
                    slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 800: '#1e293b', 900: '#0f172a' },
                    blue: { 600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a' },
                    gold: { 50: '#fefce8', 100: '#fef9c3', 400: '#facc15', 500: '#eab308', 600: '#ca8a04' }
                  },
                  animation: {
                    'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    'float': 'float 6s ease-in-out infinite',
                  },
                  keyframes: {
                    float: {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-20px)' },
                    }
                  }
                } 
              } 
            }
         }
      };
      document.head.appendChild(script);
    }
  }, []);

  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      html, body, #root { height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden; background-color: #f8fafc; font-family: 'Inter', sans-serif; }
      .h-screen-safe { height: 100vh; height: 100dvh; }
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      input, select, textarea { transition: all 0.3s ease; }
      input:focus, select:focus, textarea:focus { box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); transform: translateY(-1px); }
      th { letter-spacing: 0.05em; }
      
      /* Efeito Glassmorphism */
      .glass-panel {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
    `}</style>
  );
};

/* ===================================================================
   2. CONFIGURAÇÃO DO BANCO DE DADOS (LOCAL)
   ===================================================================
*/
const isMock = true;
const LOCAL_USER_KEY = 'asa_local_user';

const mockDB = {
  units: [],
  unitLife: {}, 
  unitSubcollections: {},
  catalogs: { unidade_etapas: [], unidade_metas: [], unidade_selos: [] },
  scoreSnapshots: [],
  load: () => { 
    try { 
      mockDB.units = JSON.parse(localStorage.getItem('asa_units_mock') || '[]'); 
      mockDB.unitLife = JSON.parse(localStorage.getItem('asa_life_mock') || '{}');
      mockDB.unitSubcollections = JSON.parse(localStorage.getItem('asa_unit_subcollections_mock') || '{}');
      mockDB.catalogs = JSON.parse(localStorage.getItem('asa_unit_catalogs_mock') || '{"unidade_etapas":[],"unidade_metas":[],"unidade_selos":[]}');
      mockDB.scoreSnapshots = JSON.parse(localStorage.getItem('asa_unit_scores_mock') || '[]');
    } catch { 
      mockDB.units = []; 
      mockDB.unitLife = {}; 
      mockDB.unitSubcollections = {};
      mockDB.catalogs = { unidade_etapas: [], unidade_metas: [], unidade_selos: [] };
      mockDB.scoreSnapshots = [];
    } 
  },
  save: () => {
    localStorage.setItem('asa_units_mock', JSON.stringify(mockDB.units));
    localStorage.setItem('asa_life_mock', JSON.stringify(mockDB.unitLife));
    localStorage.setItem('asa_unit_subcollections_mock', JSON.stringify(mockDB.unitSubcollections));
    localStorage.setItem('asa_unit_catalogs_mock', JSON.stringify(mockDB.catalogs));
    localStorage.setItem('asa_unit_scores_mock', JSON.stringify(mockDB.scoreSnapshots));
  },
  add: (data) => { mockDB.load(); mockDB.units.push({ id: Date.now().toString(), ...data, createdAt: new Date().toISOString() }); mockDB.save(); },
  update: (id, data) => { mockDB.load(); const idx = mockDB.units.findIndex(u => u.id === id); if(idx>-1) { mockDB.units[idx] = {...mockDB.units[idx], ...data}; mockDB.save(); } },
  delete: (id) => { mockDB.load(); mockDB.units = mockDB.units.filter(u => u.id !== id); mockDB.save(); },
  updateLife: (unitId, data) => {
    mockDB.load();
    mockDB.unitLife[unitId] = { ...(mockDB.unitLife[unitId] || {}), ...data };
    mockDB.save();
  },
  getLife: (unitId) => {
    mockDB.load();
    return mockDB.unitLife[unitId] || {};
  },
  ensureUnitSubcollections: (unitId) => {
    if (!mockDB.unitSubcollections[unitId]) {
      mockDB.unitSubcollections[unitId] = { etapas_status: [], metas_status: [], tarefas: [], selos_conquistados: [], participacao_mes: [] };
    }
  },
  getSubcollection: (unitId, name) => {
    mockDB.load();
    mockDB.ensureUnitSubcollections(unitId);
    return mockDB.unitSubcollections[unitId]?.[name] || [];
  },
  addSubDoc: (unitId, name, data) => {
    mockDB.load();
    mockDB.ensureUnitSubcollections(unitId);
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    mockDB.unitSubcollections[unitId][name].push({ id, ...data });
    mockDB.save();
    return id;
  },
  updateSubDoc: (unitId, name, id, data) => {
    mockDB.load();
    mockDB.ensureUnitSubcollections(unitId);
    const idx = mockDB.unitSubcollections[unitId][name].findIndex(item => item.id === id);
    if (idx > -1) {
      mockDB.unitSubcollections[unitId][name][idx] = { ...mockDB.unitSubcollections[unitId][name][idx], ...data };
      mockDB.save();
    }
  },
  deleteSubDoc: (unitId, name, id) => {
    mockDB.load();
    mockDB.ensureUnitSubcollections(unitId);
    mockDB.unitSubcollections[unitId][name] = mockDB.unitSubcollections[unitId][name].filter(item => item.id !== id);
    mockDB.save();
  },
  getCatalog: (name) => {
    mockDB.load();
    return mockDB.catalogs[name] || [];
  },
  addCatalogDoc: (name, data) => {
    mockDB.load();
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    mockDB.catalogs[name] = [...(mockDB.catalogs[name] || []), { id, ...data }];
    mockDB.save();
    return id;
  },
  updateCatalogDoc: (name, id, data) => {
    mockDB.load();
    const catalog = mockDB.catalogs[name] || [];
    mockDB.catalogs[name] = catalog.map(item => item.id === id ? { ...item, ...data } : item);
    mockDB.save();
  },
  deleteCatalogDoc: (name, id) => {
    mockDB.load();
    mockDB.catalogs[name] = (mockDB.catalogs[name] || []).filter(item => item.id !== id);
    mockDB.save();
  },
  addScoreSnapshot: (data) => {
    mockDB.load();
    mockDB.scoreSnapshots.push({ id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...data });
    mockDB.save();
  },
  exportAll: () => {
    mockDB.load();
    return {
      meta: {
        app: 'sistema-asa',
        version: 1,
        exportedAt: new Date().toISOString()
      },
      data: {
        units: mockDB.units,
        unitLife: mockDB.unitLife,
        unitSubcollections: mockDB.unitSubcollections,
        catalogs: mockDB.catalogs,
        scoreSnapshots: mockDB.scoreSnapshots
      }
    };
  },
  importAll: (payload) => {
    const data = payload?.data || payload;
    if (!data || (!data.unitLife && !data.unitSubcollections && !data.catalogs && !data.scoreSnapshots)) {
      return false;
    }
    mockDB.units = Array.isArray(data.units) ? data.units : [];
    mockDB.unitLife = data.unitLife || {};
    mockDB.unitSubcollections = data.unitSubcollections || {};
    mockDB.catalogs = data.catalogs || { unidade_etapas: [], unidade_metas: [], unidade_selos: [] };
    mockDB.scoreSnapshots = Array.isArray(data.scoreSnapshots) ? data.scoreSnapshots : [];
    mockDB.save();
    return true;
  }
};
if (isMock) mockDB.load();

/* ===================================================================
   3. HELPERS
   ===================================================================
*/
const safeRender = (val) => val === null || val === undefined || typeof val === 'object' ? '' : String(val);
const maskCEP = (value) => safeRender(value).replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
const maskPhone = (value) => safeRender(value).replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2').slice(0, 15);
const getCurrentPeriod = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const toDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const isPastDate = (value) => {
  const date = toDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};
const sum = (values) => values.reduce((acc, val) => acc + val, 0);
const roundScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const COLLECTIONS = {
  units: 'asa_units',
  etapas: 'unidade_etapas',
  metas: 'unidade_metas',
  selos: 'unidade_selos',
  scoreSnapshots: 'unidade_score_snapshot'
};

const getCollectionRef = (name, ...rest) => collection(db, 'artifacts', appId, 'public', 'data', name, ...rest);
const getDocRef = (name, ...rest) => doc(db, 'artifacts', appId, 'public', 'data', name, ...rest);
const getUnitSubcollectionRef = (unitId, subcollection) => collection(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.units, unitId, subcollection);
const getUnitSubDocRef = (unitId, subcollection, docId) => doc(db, 'artifacts', appId, 'public', 'data', COLLECTIONS.units, unitId, subcollection, docId);

const classificationFromScore = (score) => {
  if (score >= 90) return 'EXCELENCIA';
  if (score >= 80) return 'DESTAQUE';
  if (score >= 60) return 'REGULAR';
  if (score >= 40) return 'PENDENCIAS';
  return 'CRITICA';
};

const calculateUnitScore = ({ etapasCatalog, etapasStatus, metasCatalog, metasStatus, tarefas, participacao, now = new Date() }) => {
  const period = getCurrentPeriod(now);
  const activeEtapas = etapasCatalog.filter(etapa => etapa.ativo !== false);
  const mandatoryEtapas = activeEtapas.filter(etapa => etapa.obrigatoria);
  const statusByEtapa = Object.fromEntries(etapasStatus.map(status => [status.etapaId, status]));
  const mandatoryDone = mandatoryEtapas.filter(etapa => statusByEtapa[etapa.id]?.status === 'CONCLUIDA').length;
  const etapaPercent = mandatoryEtapas.length ? (mandatoryDone / mandatoryEtapas.length) * 100 : 0;
  const scoreEtapas = etapaPercent * 0.3;

  const activeMetas = metasCatalog.filter(meta => meta.ativo !== false);
  const activeMetaIds = new Set(activeMetas.map(meta => meta.id));
  const metasInPeriod = metasStatus.filter(meta => meta.periodo_referencia === period && activeMetaIds.has(meta.metaId));
  const metasAchieved = metasInPeriod.filter(meta => meta.status === 'ATINGIDA').length;
  const metaPercent = metasInPeriod.length ? (metasAchieved / metasInPeriod.length) * 100 : 0;
  const scoreMetas = metaPercent * 0.3;

  const completedTasksInMonth = tarefas.filter(task => task.status === 'CONCLUIDA' && getCurrentPeriod(toDate(task.data_conclusao) || now) === period);
  const criticalOverdue = tarefas.filter(task => task.prioridade === 'CRITICA' && task.status !== 'CONCLUIDA' && task.status !== 'CANCELADA' && isPastDate(task.data_limite) && getCurrentPeriod(toDate(task.data_limite) || now) === period).length;
  const baseRegularity = completedTasksInMonth.length > 0 ? 100 : 0;
  const regularityRaw = Math.max(baseRegularity - (criticalOverdue * 20), 0);
  const scoreRegularidade = regularityRaw * 0.2;

  const docEtapaIds = activeEtapas.filter(etapa => ['documentacao_basica', 'prestacao_contas'].includes(etapa.codigo)).map(etapa => etapa.id);
  const docCompleted = docEtapaIds.filter(id => statusByEtapa[id]?.status === 'CONCLUIDA').length;
  const docRaw = docCompleted === 2 ? 100 : docCompleted === 1 ? 50 : 0;
  const scoreDocumentacao = docRaw * 0.1;

  const participacaoRaw = participacao?.pontuacao || 0;
  const scoreParticipacao = participacaoRaw * 0.1;

  const total = sum([scoreEtapas, scoreMetas, scoreRegularidade, scoreDocumentacao, scoreParticipacao]);
  const scoreTotal = roundScore(total);

  return {
    score_total: scoreTotal,
    score_etapas: roundScore(scoreEtapas),
    score_metas: roundScore(scoreMetas),
    score_regularidade: roundScore(scoreRegularidade),
    score_documentacao: roundScore(scoreDocumentacao),
    score_participacao: roundScore(scoreParticipacao),
    classificacao: classificationFromScore(scoreTotal),
    etapa_percentual: etapaPercent,
    meta_percentual: metaPercent,
    regularidade_raw: regularityRaw,
    documentacao_raw: docRaw,
    participacao_raw: participacaoRaw
  };
};

const getPendenciaResumo = ({ etapasCatalog, etapasStatus, tarefas }) => {
  const statusByEtapa = Object.fromEntries(etapasStatus.map(status => [status.etapaId, status]));
  const mandatoryEtapas = etapasCatalog.filter(etapa => etapa.obrigatoria && etapa.ativo !== false);
  const etapasAtrasadas = mandatoryEtapas.filter(etapa => statusByEtapa[etapa.id]?.status !== 'CONCLUIDA' && isPastDate(statusByEtapa[etapa.id]?.data_limite)).length;
  const tarefasVencidas = tarefas.filter(task => task.status !== 'CONCLUIDA' && task.status !== 'CANCELADA' && isPastDate(task.data_limite)).length;
  return {
    etapasAtrasadasCount: etapasAtrasadas,
    tarefasVencidasCount: tarefasVencidas,
    temPendencias: etapasAtrasadas > 0 || tarefasVencidas > 0
  };
};

const defaultSelosCatalog = [
  {
    codigo: 'unidade_pontual',
    nome: 'Unidade Pontual',
    descricao: 'Nenhuma tarefa vencida no mês.',
    criterio_json: { regra: 'sem_tarefa_vencida_mes' },
    validade_dias: 30,
    ativo: true
  },
  {
    codigo: 'unidade_organizada',
    nome: 'Unidade Organizada',
    descricao: '100% das etapas obrigatórias concluídas.',
    criterio_json: { regra: 'etapas_obrigatorias_100' },
    validade_dias: 90,
    ativo: true
  },
  {
    codigo: 'unidade_ativa',
    nome: 'Unidade Ativa',
    descricao: 'Ao menos 2 tarefas concluídas no mês.',
    criterio_json: { regra: 'tarefas_concluidas_mes', minimo: 2 },
    validade_dias: 30,
    ativo: true
  },
  {
    codigo: 'unidade_excelencia',
    nome: 'Unidade Excelência',
    descricao: 'Score total igual ou acima de 90.',
    criterio_json: { regra: 'score_minimo', minimo: 90 },
    validade_dias: 60,
    ativo: true
  }
];

const smartFormat = (text) => {
  if (!text) return "";
  const str = String(text);
  const smallWords = ['de', 'da', 'do', 'dos', 'das', 'e', 'em', 'para', 'com', 'no', 'na'];
  return str.toLowerCase().split(' ').map((word, index) => {
    if (word === 'asa') return 'ASA';
    if (smallWords.includes(word) && index !== 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const getMissingFields = (unit) => {
  const missing = [];
  if (!unit.nomeUnidade) missing.push("Nome");
  if (!unit.nomeDiretor) missing.push("Diretor");
  if (!unit.telefone) missing.push("Tel");
  if (!unit.cep) missing.push("CEP");
  if (!unit.logradouro) missing.push("Endereço");
  if (!unit.anoEleicao) missing.push("Ano");
  return missing;
};

const isOutdated = (timestamp) => {
  if (!timestamp) return true;
  try {
    let lastUpdate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(lastUpdate.getTime())) return true;
    return Math.ceil(Math.abs(new Date() - lastUpdate) / 86400000) > 90;
  } catch { return false; }
};

const APP_VERSION = '4.5.0';
const getWhatsappLink = (phone) => {
  const digits = safeRender(phone).replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
};

const getAnoEleicaoBadge = (year) => {
  if (String(year) === '2025') return 'bg-red-50 text-red-600 border-red-200';
  if (String(year) === '2026') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const fetchAddressByCEP = async (cep) => {
  const clean = String(cep).replace(/\D/g, '');
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if(!res.ok) throw new Error();
    const data = await res.json();
    return data.erro ? null : data;
  } catch { return null; }
};

const loadSheetJS = () => new Promise((resolve, reject) => {
  if (window.XLSX) { resolve(window.XLSX); return; }
  const script = document.createElement('script');
  script.src = "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
  script.onload = () => resolve(window.XLSX);
  script.onerror = reject;
  document.head.appendChild(script);
});

const parseCSV = (text) => {
  const cleanText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const sep = (lines[0].match(/;/g)||[]).length >= (lines[0].match(/,/g)||[]).length ? ';' : ',';
  
  const splitLine = (line) => {
    const res = []; let cur = ''; let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQuote && line[i+1] === '"') { cur += '"'; i++; } else inQuote = !inQuote; }
      else if (c === sep && !inQuote) { res.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    res.push(cur.trim()); return res;
  };
  
  const headers = splitLine(lines[0]).map(h => h.toUpperCase().replace(/^"|"$/g, '').trim());
  return lines.slice(1).map(l => {
    const vals = splitLine(l);
    const obj = {};
    headers.forEach((h, i) => { 
       let v = vals[i] || ''; 
       if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
       obj[h] = v.trim(); 
    });
    return obj;
  }).filter(o => Object.values(o).some(v => v));
};

/* ===================================================================
   4. COMPONENTES VISUAIS (DESIGN SYSTEM)
   ===================================================================
*/
const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const style = `px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 duration-200 ${className}`;
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 border border-transparent",
    outline: "border-2 border-slate-300 hover:border-blue-600 text-slate-600 hover:text-blue-600 bg-white hover:bg-blue-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    gold: "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/30"
  };
  return <button type={type} className={`${style} ${variants[variant]||variants.primary}`} onClick={onClick} disabled={disabled}>{children}</button>;
};

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-lg transition-all duration-300 group cursor-default">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">{title}</p>
      <h3 className="text-4xl font-extrabold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{value}</h3>
      {subtext && <p className="text-sm text-slate-400 mt-2 font-medium">{subtext}</p>}
    </div>
    <div className={`p-5 rounded-2xl ${color} shadow-xl shadow-black/5 transform group-hover:rotate-6 transition-transform duration-300`}>
       <Icon size={36} className="text-white" strokeWidth={2.5} />
    </div>
  </div>
);

const Toast = ({ message, type, show, onClose }) => {
  if (!show) return null;
  return (
    <div className={`fixed top-8 right-8 z-[999] ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-5 animate-in slide-in-from-right fade-in duration-300 max-w-lg border-l-8 border-white/20`}>
      {type === 'success' ? <CheckCircle size={28} className="shrink-0" /> : <AlertTriangle size={28} className="shrink-0" />}
      <div className="flex-1 font-bold text-lg">{String(message)}</div>
      <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors"><X size={24}/></button>
    </div>
  );
};

const StatusBadge = ({ label, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200'
  };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${tones[tone] || tones.slate}`}>{label}</span>;
};

const ScoreBadge = ({ score }) => {
  const numeric = Number(score) || 0;
  const classification = classificationFromScore(numeric);
  const tone = classification === 'EXCELENCIA' ? 'emerald' : classification === 'DESTAQUE' ? 'blue' : classification === 'REGULAR' ? 'slate' : classification === 'PENDENCIAS' ? 'amber' : 'rose';
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold text-slate-800">{numeric}</span>
      <StatusBadge label={classification} tone={tone} />
    </div>
  );
};

const EmptyState = ({ title, description, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
      {Icon ? <Icon size={28} /> : null}
    </div>
    <h4 className="text-lg font-bold text-slate-700">{title}</h4>
    {description && <p className="text-sm text-slate-500 mt-2 max-w-md">{description}</p>}
  </div>
);

const SidebarItem = ({ icon: Icon, label, isActive, onClick, hasSubmenu, isOpen }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-200 group ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
    <div className="flex items-center gap-4">
      <Icon size={24} className={`transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
      <span className="font-semibold text-lg tracking-wide">{label}</span>
    </div>
    {hasSubmenu && (isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />)}
  </button>
);

const SubMenuItem = ({ label, isActive, onClick }) => (
  <button onClick={onClick} className={`w-full text-left pl-14 pr-6 py-3.5 text-base rounded-xl transition-all duration-200 font-medium ${isActive ? 'text-blue-400 bg-slate-800/80 border-l-4 border-blue-500' : 'text-slate-400 hover:text-white hover:bg-slate-800/30 border-l-4 border-transparent'}`}>{label}</button>
);

/* ===================================================================
   5. TELAS
   ===================================================================
*/

// --- NOVA TELA: LOGIN MODERNIZADA ---
const LoginScreen = ({ onLogin, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <TailwindInjector />
      
      {/* Background Decorativo */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90"></div>
         <div className="absolute top-0 right-0 w-2/3 h-full bg-blue-600/10 -skew-x-12 transform translate-x-20"></div>
         <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-amber-500/10 rounded-full blur-3xl transform -translate-x-20 translate-y-20"></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="w-full max-w-6xl mx-auto p-6 z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-24">
         
         {/* Lado Esquerdo: Branding */}
         <div className="flex-1 text-center md:text-left text-white space-y-6 animate-in slide-in-from-left duration-700">
             <div className="inline-flex items-center gap-3 bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-full mb-4">
                <ShieldCheck className="text-amber-400" size={20} />
                <span className="text-sm font-bold tracking-widest uppercase text-blue-200">Sistema Oficial</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                Ação Solidária <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-300">Adventista</span>
             </h1>
             <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                Gestão inteligente para unidades assistenciais. Transformando dados em impacto social real e organizado.
             </p>
             <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                <div className="flex items-center gap-2 text-sm font-medium bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                   <CheckCircle size={16} className="text-emerald-400"/> Gestão Unificada
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
                   <CheckCircle size={16} className="text-emerald-400"/> Georreferenciamento
                </div>
             </div>
         </div>

         {/* Lado Direito: Login Card */}
         <div className="w-full max-w-md animate-in slide-in-from-right duration-700 delay-150">
             <div className="glass-panel p-8 md:p-10 rounded-3xl shadow-2xl shadow-blue-900/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-blue-500"></div>
                
                <div className="mb-8 text-center">
                   <h2 className="text-2xl font-bold text-slate-800">Bem-vindo de volta</h2>
                   <p className="text-slate-500 mt-1">Acesse sua conta para continuar</p>
                   <p className="text-xs text-slate-400 mt-2">Os dados são salvos localmente no dispositivo.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">E-mail Corporativo</label>
                      <div className="relative group">
                         <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors"><Mail size={20}/></div>
                         <input 
                           type="email" 
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium transition-all text-slate-800"
                           placeholder="seu.email@asa.org.br"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                         <label className="text-sm font-bold text-slate-700">Senha</label>
                         <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">Esqueceu?</button>
                      </div>
                      <div className="relative group">
                         <div className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-600 transition-colors"><Lock size={20}/></div>
                         <input 
                           type="password" 
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium transition-all text-slate-800"
                           placeholder="••••••••"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                         />
                      </div>
                   </div>

                   <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                   >
                     {loading ? (
                        <>
                          <RefreshCw className="animate-spin" size={20}/> Acessando...
                        </>
                     ) : (
                        <>
                          Entrar no Sistema <ChevronRight size={20} strokeWidth={3}/>
                        </>
                     )}
                   </button>
                </form>

                <div className="mt-8 text-center">
                   <p className="text-xs text-slate-400 font-medium">
                      © 2025 Ação Solidária Adventista. Todos os direitos reservados.
                   </p>
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};

// --- UNIT LIFE SCREEN ---
const UnitLifeScreen = ({ units, showToast }) => {
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [activeTab, setActiveTab] = useState('excellence'); 
  const [lifeData, setLifeData] = useState({
     docs: '', reports: '', team: '', structure: '', finance: '', 
     excellenceByMonth: {} 
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  useEffect(() => {
    if (!selectedUnitId) {
        setLifeData({ docs: '', reports: '', team: '', structure: '', finance: '', excellenceByMonth: {} });
        return;
    }
    const loadLifeData = async () => {
      try {
        const docRef = doc(getUnitSubcollectionRef(selectedUnitId, 'unit_life'), 'info');
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setLifeData(snapshot.data());
        } else {
          setLifeData({ docs: '', reports: '', team: '', structure: '', finance: '', excellenceByMonth: {} });
        }
      } catch (error) {
        console.error(error);
        showToast('Erro ao carregar vida da unidade.', 'error');
      }
    };
    loadLifeData();
  }, [selectedUnitId, showToast]);

  const handleSaveLife = async () => {
      if(!selectedUnitId) return;
      try {
        const docRef = doc(getUnitSubcollectionRef(selectedUnitId, 'unit_life'), 'info');
        await setDoc(docRef, { ...lifeData, updatedAt: serverTimestamp() }, { merge: true });
        showToast("Dados da Vida da Unidade salvos!", "success");
      } catch (error) {
        console.error(error);
        showToast("Erro ao salvar Vida da Unidade.", "error");
      }
  };

  const toggleMonthExcellence = (monthIndex) => {
     const key = `${selectedYear}-${monthIndex}`;
     const currentStatus = lifeData.excellenceByMonth?.[key] || false;
     setLifeData(prev => ({ ...prev, excellenceByMonth: { ...prev.excellenceByMonth, [key]: !currentStatus } }));
  };

  const tabs = [
      { id: 'excellence', label: 'Selo Excelência', icon: Award },
      { id: 'docs', label: 'Documentação', icon: FileText },
      { id: 'reports', label: 'Relatórios', icon:  FileSpreadsheet},
      { id: 'team', label: 'Equipe', icon: Users },
      { id: 'structure', label: 'Estrutura', icon: Building2 },
      { id: 'finance', label: 'Prestação Contas', icon: DollarSign },
  ];

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
       <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
           <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3"><HeartHandshake className="text-blue-600" size={32}/> Vida da Unidade</h2>
           <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Selecione a Unidade</label>
           <div className="relative">
               <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-lg font-medium appearance-none" value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)}>
                   <option value="">-- Escolha uma unidade --</option>
                   {units.map(u => <option key={u.id} value={u.id}>{u.nomeUnidade}</option>)}
               </select>
               <ChevronDown className="absolute right-5 top-5 text-slate-400 pointer-events-none"/>
           </div>
       </div>

       {selectedUnit && (
           <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[600px]">
               <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-6 flex flex-col gap-2">
                   {tabs.map(tab => (
                       <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-5 py-4 rounded-xl text-left transition-all ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-md font-bold border border-slate-100' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium'}`}>
                           <tab.icon size={20} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}/> {tab.label}
                       </button>
                   ))}
               </div>
               <div className="flex-1 p-8 md:p-12 relative flex flex-col">
                   {activeTab === 'excellence' && (
                       <div className="animate-in fade-in slide-in-from-bottom-4">
                           <div className="flex justify-between items-center mb-8">
                               <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Award size={28} className="text-yellow-500" /> Selo de Excelência</h3>
                               <select className="p-3 border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-yellow-400" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>{[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}</select>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                               {months.map((month, index) => {
                                   const isExcellent = lifeData.excellenceByMonth?.[`${selectedYear}-${index}`];
                                   return (
                                       <div key={index} className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${isExcellent ? 'border-yellow-400 bg-yellow-50 shadow-lg' : 'border-slate-100 bg-white hover:border-slate-200'}`} onClick={() => toggleMonthExcellence(index)}>
                                           <div className="flex justify-between items-start mb-4">
                                               <span className={`text-lg font-bold ${isExcellent ? 'text-yellow-800' : 'text-slate-400'}`}>{month}</span>
                                               <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExcellent ? 'bg-yellow-500 text-white' : 'bg-slate-100 text-slate-300'}`}>{isExcellent ? <Check size={18} strokeWidth={3}/> : <div className="w-3 h-3 rounded-full bg-slate-200"/>}</div>
                                           </div>
                                           {isExcellent ? (
                                               <div className="flex flex-col items-center py-2 animate-in zoom-in duration-300">
                                                   <Award size={64} className="text-yellow-500 drop-shadow-md mb-2" strokeWidth={1.5} />
                                                   <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest bg-yellow-200/50 px-3 py-1 rounded-full">Selo Conquistado</span>
                                               </div>
                                           ) : (
                                               <div className="flex flex-col items-center py-4 opacity-30 group-hover:opacity-60 transition-opacity"><Award size={48} className="text-slate-300 mb-2" /><span className="text-xs font-medium text-slate-400">Requisitos Pendentes</span></div>
                                           )}
                                       </div>
                                   );
                               })}
                           </div>
                           <div className="mt-8 flex justify-end"><Button onClick={handleSaveLife} className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/20 px-8">Salvar Alterações</Button></div>
                       </div>
                   )}
                   {activeTab !== 'excellence' && (
                       <div className="h-full flex flex-col animate-in fade-in">
                           <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">{React.createElement(tabs.find(t => t.id === activeTab)?.icon, { size: 28, className: "text-blue-600" })} {tabs.find(t => t.id === activeTab)?.label}</h3>
                           <textarea className="flex-1 w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-base resize-none mb-6" placeholder={`Insira aqui as informações sobre ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`} value={lifeData[activeTab] || ''} onChange={(e) => setLifeData({...lifeData, [activeTab]: e.target.value})} rows={12}/>
                           <div className="flex justify-end"><Button onClick={handleSaveLife} className="px-10">Salvar Informações</Button></div>
                       </div>
                   )}
               </div>
           </div>
       )}
    </div>
  );
};

const UnitDashboardScreen = ({ units, showToast }) => {
  const [pendencias, setPendencias] = useState([]);
  const [loadingPendencias, setLoadingPendencias] = useState(false);

  useEffect(() => {
    const loadPendencias = async () => {
      setLoadingPendencias(true);
      const pendenciasList = [];
      for (const unit of units) {
        try {
          const tarefas = isMock ? mockDB.getSubcollection(unit.id, 'tarefas') : (await getDocs(getUnitSubcollectionRef(unit.id, 'tarefas'))).docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          const etapasStatus = isMock ? mockDB.getSubcollection(unit.id, 'etapas_status') : (await getDocs(getUnitSubcollectionRef(unit.id, 'etapas_status'))).docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          const etapasCatalog = isMock ? mockDB.getCatalog(COLLECTIONS.etapas) : (await getDocs(getCollectionRef(COLLECTIONS.etapas))).docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
          const statusByEtapa = Object.fromEntries(etapasStatus.map(status => [status.etapaId, status]));
          etapasCatalog.forEach(etapa => {
            const status = statusByEtapa[etapa.id];
            if (etapa.obrigatoria && status?.status !== 'CONCLUIDA' && isPastDate(status?.data_limite)) {
              pendenciasList.push({
                id: `${unit.id}_${etapa.id}`,
                unitId: unit.id,
                unitName: unit.nomeUnidade,
                tipo: 'Etapa',
                titulo: etapa.nome,
                data_limite: status?.data_limite
              });
            }
          });
          tarefas.forEach(task => {
            if (task.status !== 'CONCLUIDA' && task.status !== 'CANCELADA' && isPastDate(task.data_limite)) {
              pendenciasList.push({
                id: `${unit.id}_${task.id}`,
                unitId: unit.id,
                unitName: unit.nomeUnidade,
                tipo: 'Tarefa',
                titulo: task.titulo,
                data_limite: task.data_limite
              });
            }
          });
        } catch (error) {
          console.error(error);
          showToast('Erro ao carregar pendências', 'error');
        }
      }
      setPendencias(pendenciasList);
      setLoadingPendencias(false);
    };

    if (units.length) loadPendencias();
    else setPendencias([]);
  }, [units, showToast]);

  const total = units.length;
  const compliant = total ? Math.round((units.filter(unit => (unit.scoreAtual || 0) >= 60).length / total) * 100) : 0;
  const pendingCount = units.filter(unit => unit.temPendencias || unit.pendencias).length;
  const sortedByScore = [...units].sort((a, b) => (b.scoreAtual || 0) - (a.scoreAtual || 0));
  const destaque = sortedByScore.slice(0, 5);
  const criticas = [...units].sort((a, b) => (a.scoreAtual || 0) - (b.scoreAtual || 0)).slice(0, 5);

  return (
    <div className="space-y-10 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total de Unidades" value={total} icon={Building2} color="bg-blue-600" />
        <StatCard title="% em Conformidade" value={`${compliant}%`} icon={CheckCircle} color="bg-emerald-600" />
        <StatCard title="Unidades com Pendências" value={pendingCount} icon={AlertTriangle} color="bg-amber-500" />
        <StatCard title="Pendências Identificadas" value={pendencias.length} icon={AlertOctagon} color="bg-rose-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3"><Star className="text-blue-600" size={24} /> Top 5 Destaque</h3>
          {destaque.length === 0 ? (
            <EmptyState title="Sem unidades cadastradas" description="Cadastre unidades para acompanhar o desempenho." icon={Building2} />
          ) : (
            <div className="space-y-4">
              {destaque.map(unit => (
                <div key={unit.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-700">{unit.nomeUnidade}</p>
                    <p className="text-xs text-slate-500">{unit.regiao || 'Região não informada'}</p>
                  </div>
                  <ScoreBadge score={unit.scoreAtual || 0} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3"><AlertTriangle className="text-rose-600" size={24} /> Top 5 Críticas</h3>
          {criticas.length === 0 ? (
            <EmptyState title="Sem unidades cadastradas" description="Cadastre unidades para acompanhar o desempenho." icon={Building2} />
          ) : (
            <div className="space-y-4">
              {criticas.map(unit => (
                <div key={unit.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-700">{unit.nomeUnidade}</p>
                    <p className="text-xs text-slate-500">{unit.regiao || 'Região não informada'}</p>
                  </div>
                  <ScoreBadge score={unit.scoreAtual || 0} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3"><AlertOctagon className="text-amber-600" size={24} /> Pendências</h3>
          {loadingPendencias ? (
            <div className="text-slate-500">Carregando pendências...</div>
          ) : pendencias.length === 0 ? (
            <EmptyState title="Nenhuma pendência" description="Não há tarefas ou etapas vencidas." icon={CheckCircle} />
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {pendencias.map(item => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.titulo}</p>
                      <p className="text-xs text-slate-500">{item.unitName}</p>
                    </div>
                    <StatusBadge label={item.tipo} tone={item.tipo === 'Tarefa' ? 'rose' : 'amber'} />
                  </div>
                  {item.data_limite && (
                    <p className="text-xs text-slate-500 mt-2">Limite: {toDate(item.data_limite)?.toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UnitsManagementScreen = ({ units, onSelectUnit }) => {
  const [filters, setFilters] = useState({ regiao: '', distrito: '', score: '', pendencias: '' });

  const filteredUnits = units.filter(unit => {
    const matchesRegiao = filters.regiao ? String(unit.regiao || '').toLowerCase().includes(filters.regiao.toLowerCase()) : true;
    const matchesDistrito = filters.distrito ? String(unit.distrito || '').toLowerCase().includes(filters.distrito.toLowerCase()) : true;
    const scoreValue = Number(unit.scoreAtual || 0);
    const matchesScore = filters.score
      ? filters.score === 'critica'
        ? scoreValue < 40
        : filters.score === 'pendencias'
          ? scoreValue >= 40 && scoreValue < 60
          : filters.score === 'regular'
            ? scoreValue >= 60 && scoreValue < 80
            : filters.score === 'destaque'
              ? scoreValue >= 80 && scoreValue < 90
              : scoreValue >= 90
      : true;
    const matchesPendencias = filters.pendencias
      ? filters.pendencias === 'sim'
        ? unit.temPendencias || unit.pendencias
        : !(unit.temPendencias || unit.pendencias)
      : true;
    return matchesRegiao && matchesDistrito && matchesScore && matchesPendencias;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3"><Building2 className="text-blue-600" size={28} /> Unidades ASA</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium" placeholder="Filtrar por região" value={filters.regiao} onChange={e => setFilters(prev => ({ ...prev, regiao: e.target.value }))} />
          <input className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium" placeholder="Filtrar por distrito" value={filters.distrito} onChange={e => setFilters(prev => ({ ...prev, distrito: e.target.value }))} />
          <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium" value={filters.score} onChange={e => setFilters(prev => ({ ...prev, score: e.target.value }))}>
            <option value="">Score</option>
            <option value="critica">Crítica</option>
            <option value="pendencias">Pendências</option>
            <option value="regular">Regular</option>
            <option value="destaque">Destaque</option>
            <option value="excelencia">Excelência</option>
          </select>
          <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium" value={filters.pendencias} onChange={e => setFilters(prev => ({ ...prev, pendencias: e.target.value }))}>
            <option value="">Pendências?</option>
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="p-6">Unidade</th>
                <th className="p-6">Região</th>
                <th className="p-6">Distrito</th>
                <th className="p-6">Score</th>
                <th className="p-6">Pendências</th>
                <th className="p-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map(unit => (
                <tr key={unit.id} className="border-t border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="p-6 font-semibold text-slate-700">{unit.nomeUnidade}</td>
                  <td className="p-6 text-slate-500">{unit.regiao || '-'}</td>
                  <td className="p-6 text-slate-500">{unit.distrito || '-'}</td>
                  <td className="p-6"><ScoreBadge score={unit.scoreAtual || 0} /></td>
                  <td className="p-6">
                    {unit.temPendencias || unit.pendencias ? <StatusBadge label="Com Pendências" tone="amber" /> : <StatusBadge label="Sem Pendências" tone="emerald" />}
                  </td>
                  <td className="p-6 text-right">
                    <Button variant="outline" className="px-4 py-2 text-sm" onClick={() => onSelectUnit(unit.id)}>
                      <ExternalLink size={18} /> Detalhar
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10">
                    <EmptyState title="Nenhuma unidade encontrada" description="Ajuste os filtros para ver mais resultados." icon={Search} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UnitDetailScreen = ({ unit, etapasCatalog, metasCatalog, selosCatalog, showToast, onBack, onCatalogRefresh }) => {
  const [activeTab, setActiveTab] = useState('geral');
  const [etapasStatus, setEtapasStatus] = useState([]);
  const [metasStatus, setMetasStatus] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [selosConquistados, setSelosConquistados] = useState([]);
  const [participacaoMes, setParticipacaoMes] = useState(null);
  const [etapasDrafts, setEtapasDrafts] = useState({});
  const [metaForm, setMetaForm] = useState({
    metaId: '',
    periodo_referencia: getCurrentPeriod(),
    status: 'PENDENTE',
    valor_alvo: '',
    valor_real: '',
    data_limite: '',
    data_fechamento: '',
    responsavel: '',
    observacao: ''
  });
  const [editingMetaId, setEditingMetaId] = useState(null);
  const [tarefaForm, setTarefaForm] = useState({
    titulo: '',
    descricao: '',
    prioridade: 'MEDIA',
    status: 'PENDENTE',
    data_limite: '',
    data_conclusao: '',
    responsavel: '',
    origem: 'MANUAL',
    penaliza_score: true
  });
  const [editingTarefaId, setEditingTarefaId] = useState(null);
  const [participacaoForm, setParticipacaoForm] = useState({
    periodo_referencia: getCurrentPeriod(),
    pontuacao: 0,
    observacao: ''
  });
  const [etapaCatalogForm, setEtapaCatalogForm] = useState({ codigo: '', nome: '', descricao: '', ordem: 1, obrigatoria: false, peso: 0, ativo: true });
  const [metaCatalogForm, setMetaCatalogForm] = useState({ codigo: '', nome: '', descricao: '', periodicidade: 'MENSAL', tipo: 'QUANTITATIVA', peso: 0, ativo: true });
  const [seloCatalogForm, setSeloCatalogForm] = useState({ codigo: '', nome: '', descricao: '', criterio_json: '{}', validade_dias: 30, ativo: true });

  useEffect(() => {
    if (!unit) return;
    if (isMock) {
      setEtapasStatus(mockDB.getSubcollection(unit.id, 'etapas_status'));
      setMetasStatus(mockDB.getSubcollection(unit.id, 'metas_status'));
      setTarefas(mockDB.getSubcollection(unit.id, 'tarefas'));
      setSelosConquistados(mockDB.getSubcollection(unit.id, 'selos_conquistados'));
      const participacoes = mockDB.getSubcollection(unit.id, 'participacao_mes');
      const current = participacoes.find(item => item.periodo_referencia === getCurrentPeriod()) || null;
      setParticipacaoMes(current);
      if (current) setParticipacaoForm({ periodo_referencia: current.periodo_referencia, pontuacao: current.pontuacao, observacao: current.observacao || '' });
    } else {
      const unsubEtapas = onSnapshot(getUnitSubcollectionRef(unit.id, 'etapas_status'), snapshot => {
        setEtapasStatus(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      const unsubMetas = onSnapshot(getUnitSubcollectionRef(unit.id, 'metas_status'), snapshot => {
        setMetasStatus(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      const unsubTarefas = onSnapshot(getUnitSubcollectionRef(unit.id, 'tarefas'), snapshot => {
        setTarefas(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      const unsubSelos = onSnapshot(getUnitSubcollectionRef(unit.id, 'selos_conquistados'), snapshot => {
        setSelosConquistados(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      const unsubParticipacao = onSnapshot(getUnitSubcollectionRef(unit.id, 'participacao_mes'), snapshot => {
        const current = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })).find(item => item.periodo_referencia === getCurrentPeriod()) || null;
        setParticipacaoMes(current);
        if (current) setParticipacaoForm({ periodo_referencia: current.periodo_referencia, pontuacao: current.pontuacao, observacao: current.observacao || '' });
      });
      return () => {
        unsubEtapas();
        unsubMetas();
        unsubTarefas();
        unsubSelos();
        unsubParticipacao();
      };
    }
  }, [unit]);

  useEffect(() => {
    if (!unit) return;
    const drafts = {};
    etapasCatalog.forEach(etapa => {
      const status = etapasStatus.find(item => item.etapaId === etapa.id);
      drafts[etapa.id] = {
        statusDocId: status?.id || null,
        status: status?.status || 'PENDENTE',
        data_limite: status?.data_limite ? toDate(status.data_limite)?.toISOString().slice(0, 10) : '',
        data_conclusao: status?.data_conclusao ? toDate(status.data_conclusao)?.toISOString().slice(0, 10) : '',
        responsavel: status?.responsavel || '',
        observacao: status?.observacao || ''
      };
    });
    setEtapasDrafts(drafts);
  }, [unit, etapasCatalog, etapasStatus]);

  if (!unit) return null;

  const updateUnitSummary = async (summary) => {
    if (isMock) {
      mockDB.update(unit.id, summary);
    } else {
      await updateDoc(getDocRef(COLLECTIONS.units, unit.id), summary);
    }
  };

  const createScoreSnapshot = async (scoreData) => {
    const snapshotData = {
      unidadeId: unit.id,
      periodo_referencia: getCurrentPeriod(),
      score_total: scoreData.score_total,
      score_etapas: scoreData.score_etapas,
      score_metas: scoreData.score_metas,
      score_regularidade: scoreData.score_regularidade,
      score_documentacao: scoreData.score_documentacao,
      score_participacao: scoreData.score_participacao,
      classificacao: scoreData.classificacao,
      detalhes_json: scoreData,
      createdAt: isMock ? new Date().toISOString() : serverTimestamp()
    };
    if (isMock) mockDB.addScoreSnapshot(snapshotData);
    else await addDoc(getCollectionRef(COLLECTIONS.scoreSnapshots), snapshotData);
  };

  const updateSelos = async (scoreData) => {
    const now = new Date();
    const period = getCurrentPeriod(now);
    const completedTasksInMonth = tarefas.filter(task => task.status === 'CONCLUIDA' && getCurrentPeriod(toDate(task.data_conclusao) || now) === period);
    const overdueTasksInMonth = tarefas.filter(task => task.status !== 'CONCLUIDA' && task.status !== 'CANCELADA' && isPastDate(task.data_limite) && getCurrentPeriod(toDate(task.data_limite) || now) === period);
    const mandatoryEtapas = etapasCatalog.filter(etapa => etapa.obrigatoria && etapa.ativo !== false);
    const statusByEtapa = Object.fromEntries(etapasStatus.map(status => [status.etapaId, status]));
    const mandatoryDone = mandatoryEtapas.filter(etapa => statusByEtapa[etapa.id]?.status === 'CONCLUIDA').length;
    const allMandatoryDone = mandatoryEtapas.length > 0 && mandatoryDone === mandatoryEtapas.length;
    const rules = {
      unidade_pontual: overdueTasksInMonth.length === 0,
      unidade_organizada: allMandatoryDone,
      unidade_ativa: completedTasksInMonth.length >= 2,
      unidade_excelencia: scoreData.score_total >= 90
    };
    for (const selo of selosCatalog.filter(item => item.ativo !== false)) {
      const meetsRule = rules[selo.codigo] || false;
      const existing = selosConquistados.find(item => item.seloId === selo.id);
      const expiryDate = selo.validade_dias ? new Date(now.getTime() + (selo.validade_dias * 86400000)) : null;
      if (existing) {
        const isExpired = existing.data_expira && toDate(existing.data_expira) < now;
        if (isExpired && existing.ativo) {
          if (isMock) mockDB.updateSubDoc(unit.id, 'selos_conquistados', existing.id, { ativo: false });
          else await updateDoc(getUnitSubDocRef(unit.id, 'selos_conquistados', existing.id), { ativo: false });
        }
        if (meetsRule && (!existing.ativo || isExpired)) {
          const update = { ativo: true, data_conquista: now.toISOString(), data_expira: expiryDate ? expiryDate.toISOString() : null, motivo: selo.descricao };
          if (isMock) mockDB.updateSubDoc(unit.id, 'selos_conquistados', existing.id, update);
          else await updateDoc(getUnitSubDocRef(unit.id, 'selos_conquistados', existing.id), update);
        } else if (!meetsRule && existing.ativo) {
          if (isMock) mockDB.updateSubDoc(unit.id, 'selos_conquistados', existing.id, { ativo: false });
          else await updateDoc(getUnitSubDocRef(unit.id, 'selos_conquistados', existing.id), { ativo: false });
        }
      } else if (meetsRule) {
        const newData = {
          seloId: selo.id,
          data_conquista: now.toISOString(),
          data_expira: expiryDate ? expiryDate.toISOString() : null,
          ativo: true,
          motivo: selo.descricao
        };
        if (isMock) mockDB.addSubDoc(unit.id, 'selos_conquistados', newData);
        else await addDoc(getUnitSubcollectionRef(unit.id, 'selos_conquistados'), newData);
      }
    }
  };

  const runAutomation = async (override = {}) => {
    const currentEtapasStatus = override.etapasStatus || etapasStatus;
    const currentMetasStatus = override.metasStatus || metasStatus;
    const currentTarefas = override.tarefas || tarefas;
    const currentParticipacao = override.participacao || participacaoMes;
    const scoreData = calculateUnitScore({
      etapasCatalog,
      etapasStatus: currentEtapasStatus,
      metasCatalog,
      metasStatus: currentMetasStatus,
      tarefas: currentTarefas,
      participacao: currentParticipacao
    });
    const pendencias = getPendenciaResumo({ etapasCatalog, etapasStatus: currentEtapasStatus, tarefas: currentTarefas });
    await updateUnitSummary({
      scoreAtual: scoreData.score_total,
      scoreEtapas: scoreData.score_etapas,
      scoreMetas: scoreData.score_metas,
      scoreRegularidade: scoreData.score_regularidade,
      scoreDocumentacao: scoreData.score_documentacao,
      scoreParticipacao: scoreData.score_participacao,
      classificacaoAtual: scoreData.classificacao,
      temPendencias: pendencias.temPendencias,
      tarefasVencidasCount: pendencias.tarefasVencidasCount,
      etapasAtrasadasCount: pendencias.etapasAtrasadasCount,
      updatedAt: isMock ? new Date().toISOString() : serverTimestamp()
    });
    await createScoreSnapshot(scoreData);
    await updateSelos(scoreData);
    showToast('Atualizações aplicadas', 'success');
  };

  const handleSaveEtapaStatus = async (etapaId) => {
    const draft = etapasDrafts[etapaId];
    if (!draft) return;
    const payload = {
      etapaId,
      status: draft.status,
      data_limite: draft.data_limite || null,
      data_conclusao: draft.status === 'CONCLUIDA' ? draft.data_conclusao || new Date().toISOString().slice(0, 10) : draft.data_conclusao || null,
      responsavel: draft.responsavel || '',
      observacao: draft.observacao || ''
    };
    if (isMock) {
      if (draft.statusDocId) {
        mockDB.updateSubDoc(unit.id, 'etapas_status', draft.statusDocId, payload);
      } else {
        const newId = mockDB.addSubDoc(unit.id, 'etapas_status', payload);
        setEtapasDrafts(prev => ({ ...prev, [etapaId]: { ...draft, statusDocId: newId } }));
      }
      setEtapasStatus(mockDB.getSubcollection(unit.id, 'etapas_status'));
    } else if (draft.statusDocId) {
      await updateDoc(getUnitSubDocRef(unit.id, 'etapas_status', draft.statusDocId), payload);
    } else {
      const docRef = await addDoc(getUnitSubcollectionRef(unit.id, 'etapas_status'), payload);
      setEtapasDrafts(prev => ({ ...prev, [etapaId]: { ...draft, statusDocId: docRef.id } }));
    }
    await runAutomation();
  };

  const handleMetaSave = async (e) => {
    e.preventDefault();
    const payload = {
      metaId: metaForm.metaId,
      periodo_referencia: metaForm.periodo_referencia,
      status: metaForm.status,
      valor_alvo: metaForm.valor_alvo,
      valor_real: metaForm.valor_real,
      data_limite: metaForm.data_limite || null,
      data_fechamento: metaForm.data_fechamento || null,
      responsavel: metaForm.responsavel,
      observacao: metaForm.observacao
    };
    if (!payload.metaId) {
      showToast('Selecione uma meta', 'error');
      return;
    }
    if (isMock) {
      if (editingMetaId) mockDB.updateSubDoc(unit.id, 'metas_status', editingMetaId, payload);
      else mockDB.addSubDoc(unit.id, 'metas_status', payload);
      setMetasStatus(mockDB.getSubcollection(unit.id, 'metas_status'));
    } else if (editingMetaId) {
      await updateDoc(getUnitSubDocRef(unit.id, 'metas_status', editingMetaId), payload);
    } else {
      await addDoc(getUnitSubcollectionRef(unit.id, 'metas_status'), payload);
    }
    setMetaForm({ metaId: '', periodo_referencia: getCurrentPeriod(), status: 'PENDENTE', valor_alvo: '', valor_real: '', data_limite: '', data_fechamento: '', responsavel: '', observacao: '' });
    setEditingMetaId(null);
    await runAutomation();
  };

  const handleMetaEdit = (meta) => {
    setEditingMetaId(meta.id);
    setMetaForm({
      metaId: meta.metaId,
      periodo_referencia: meta.periodo_referencia,
      status: meta.status,
      valor_alvo: meta.valor_alvo || '',
      valor_real: meta.valor_real || '',
      data_limite: meta.data_limite ? toDate(meta.data_limite)?.toISOString().slice(0, 10) : '',
      data_fechamento: meta.data_fechamento ? toDate(meta.data_fechamento)?.toISOString().slice(0, 10) : '',
      responsavel: meta.responsavel || '',
      observacao: meta.observacao || ''
    });
  };

  const handleMetaDelete = async (id) => {
    if (!window.confirm('Remover meta da unidade?')) return;
    if (isMock) {
      mockDB.deleteSubDoc(unit.id, 'metas_status', id);
      setMetasStatus(mockDB.getSubcollection(unit.id, 'metas_status'));
    } else {
      await deleteDoc(getUnitSubDocRef(unit.id, 'metas_status', id));
    }
    await runAutomation();
  };

  const handleTarefaSave = async (e) => {
    e.preventDefault();
    if (!tarefaForm.titulo) {
      showToast('Informe o título da tarefa', 'error');
      return;
    }
    const payload = {
      ...tarefaForm,
      data_limite: tarefaForm.data_limite || null,
      data_conclusao: tarefaForm.data_conclusao || null
    };
    if (isMock) {
      if (editingTarefaId) mockDB.updateSubDoc(unit.id, 'tarefas', editingTarefaId, payload);
      else mockDB.addSubDoc(unit.id, 'tarefas', payload);
      setTarefas(mockDB.getSubcollection(unit.id, 'tarefas'));
    } else if (editingTarefaId) {
      await updateDoc(getUnitSubDocRef(unit.id, 'tarefas', editingTarefaId), payload);
    } else {
      await addDoc(getUnitSubcollectionRef(unit.id, 'tarefas'), payload);
    }
    setTarefaForm({ titulo: '', descricao: '', prioridade: 'MEDIA', status: 'PENDENTE', data_limite: '', data_conclusao: '', responsavel: '', origem: 'MANUAL', penaliza_score: true });
    setEditingTarefaId(null);
    await runAutomation();
  };

  const handleTarefaEdit = (task) => {
    setEditingTarefaId(task.id);
    setTarefaForm({
      titulo: task.titulo,
      descricao: task.descricao || '',
      prioridade: task.prioridade || 'MEDIA',
      status: task.status || 'PENDENTE',
      data_limite: task.data_limite ? toDate(task.data_limite)?.toISOString().slice(0, 10) : '',
      data_conclusao: task.data_conclusao ? toDate(task.data_conclusao)?.toISOString().slice(0, 10) : '',
      responsavel: task.responsavel || '',
      origem: task.origem || 'MANUAL',
      penaliza_score: task.penaliza_score !== false
    });
  };

  const handleTarefaDelete = async (id) => {
    if (!window.confirm('Remover tarefa?')) return;
    if (isMock) {
      mockDB.deleteSubDoc(unit.id, 'tarefas', id);
      setTarefas(mockDB.getSubcollection(unit.id, 'tarefas'));
    } else {
      await deleteDoc(getUnitSubDocRef(unit.id, 'tarefas', id));
    }
    await runAutomation();
  };

  const handleParticipacaoSave = async () => {
    const payload = {
      periodo_referencia: participacaoForm.periodo_referencia,
      pontuacao: Number(participacaoForm.pontuacao) || 0,
      observacao: participacaoForm.observacao
    };
    if (isMock) {
      if (participacaoMes?.id) mockDB.updateSubDoc(unit.id, 'participacao_mes', participacaoMes.id, payload);
      else mockDB.addSubDoc(unit.id, 'participacao_mes', payload);
      const participacoes = mockDB.getSubcollection(unit.id, 'participacao_mes');
      const current = participacoes.find(item => item.periodo_referencia === getCurrentPeriod()) || null;
      setParticipacaoMes(current);
    } else if (participacaoMes?.id) {
      await updateDoc(getUnitSubDocRef(unit.id, 'participacao_mes', participacaoMes.id), payload);
    } else {
      await addDoc(getUnitSubcollectionRef(unit.id, 'participacao_mes'), payload);
    }
    await runAutomation();
  };

  const handleAddEtapaCatalog = async (e) => {
    e.preventDefault();
    if (!etapaCatalogForm.codigo || !etapaCatalogForm.nome) {
      showToast('Informe código e nome da etapa', 'error');
      return;
    }
    const payload = { ...etapaCatalogForm, ordem: Number(etapaCatalogForm.ordem) || 0, peso: Number(etapaCatalogForm.peso) || 0 };
    if (isMock) {
      mockDB.addCatalogDoc(COLLECTIONS.etapas, payload);
      onCatalogRefresh?.();
    } else {
      await addDoc(getCollectionRef(COLLECTIONS.etapas), payload);
    }
    setEtapaCatalogForm({ codigo: '', nome: '', descricao: '', ordem: 1, obrigatoria: false, peso: 0, ativo: true });
  };

  const handleAddMetaCatalog = async (e) => {
    e.preventDefault();
    if (!metaCatalogForm.codigo || !metaCatalogForm.nome) {
      showToast('Informe código e nome da meta', 'error');
      return;
    }
    const payload = { ...metaCatalogForm, peso: Number(metaCatalogForm.peso) || 0 };
    if (isMock) {
      mockDB.addCatalogDoc(COLLECTIONS.metas, payload);
      onCatalogRefresh?.();
    } else {
      await addDoc(getCollectionRef(COLLECTIONS.metas), payload);
    }
    setMetaCatalogForm({ codigo: '', nome: '', descricao: '', periodicidade: 'MENSAL', tipo: 'QUANTITATIVA', peso: 0, ativo: true });
  };

  const handleAddSeloCatalog = async (e) => {
    e.preventDefault();
    if (!seloCatalogForm.codigo || !seloCatalogForm.nome) {
      showToast('Informe código e nome do selo', 'error');
      return;
    }
    let criterioJson = {};
    try {
      criterioJson = seloCatalogForm.criterio_json ? JSON.parse(seloCatalogForm.criterio_json) : {};
    } catch (error) {
      showToast('criterio_json inválido', 'error');
      return;
    }
    const payload = { ...seloCatalogForm, criterio_json: criterioJson, validade_dias: Number(seloCatalogForm.validade_dias) || 0 };
    if (isMock) {
      mockDB.addCatalogDoc(COLLECTIONS.selos, payload);
      onCatalogRefresh?.();
    } else {
      await addDoc(getCollectionRef(COLLECTIONS.selos), payload);
    }
    setSeloCatalogForm({ codigo: '', nome: '', descricao: '', criterio_json: '{}', validade_dias: 30, ativo: true });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={onBack} className="text-sm font-bold text-blue-600 flex items-center gap-2"><ChevronLeft size={18} /> Voltar</button>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2">{unit.nomeUnidade}</h2>
          <p className="text-sm text-slate-500">{unit.regiao || 'Região não informada'} • {unit.distrito || 'Distrito não informado'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="px-5 py-3" onClick={() => runAutomation()}><RefreshCw size={18} /> Recalcular Score</Button>
          <Button
            variant="outline"
            className="px-5 py-3"
            onClick={async () => {
              await updateSelos(calculateUnitScore({ etapasCatalog, etapasStatus, metasCatalog, metasStatus, tarefas, participacao: participacaoMes }));
              showToast('Selos recalculados', 'success');
            }}
          >
            <Award size={18} /> Recalcular Selos
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {['geral', 'etapas', 'metas', 'tarefas', 'selos'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 rounded-full text-sm font-bold ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
            {tab === 'geral' && 'Visão Geral'}
            {tab === 'etapas' && 'Etapas'}
            {tab === 'metas' && 'Metas'}
            {tab === 'tarefas' && 'Tarefas'}
            {tab === 'selos' && 'Selos'}
          </button>
        ))}
      </div>

      {activeTab === 'geral' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3"><LayoutDashboard className="text-blue-600" size={24} /> Score Atual</h3>
              <div className="flex items-center justify-between">
                <ScoreBadge score={unit.scoreAtual || 0} />
                <div className="text-sm text-slate-500">Última atualização: {unit.updatedAt ? toDate(unit.updatedAt)?.toLocaleDateString('pt-BR') : 'N/D'}</div>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="font-bold text-slate-700">Etapas</p>
                  <p className="text-2xl font-extrabold text-slate-800">{unit.scoreEtapas || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="font-bold text-slate-700">Metas</p>
                  <p className="text-2xl font-extrabold text-slate-800">{unit.scoreMetas || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="font-bold text-slate-700">Regularidade</p>
                  <p className="text-2xl font-extrabold text-slate-800">{unit.scoreRegularidade || 0}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="font-bold text-slate-700">Documentação</p>
                  <p className="text-2xl font-extrabold text-slate-800">{unit.scoreDocumentacao || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3"><Users className="text-blue-600" size={24} /> Participação Mensal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Período</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" value={participacaoForm.periodo_referencia} onChange={e => setParticipacaoForm(prev => ({ ...prev, periodo_referencia: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pontuação (0-100)</label>
                  <input type="number" min="0" max="100" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" value={participacaoForm.pontuacao} onChange={e => setParticipacaoForm(prev => ({ ...prev, pontuacao: e.target.value }))} />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Observação</label>
                  <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" rows="3" value={participacaoForm.observacao} onChange={e => setParticipacaoForm(prev => ({ ...prev, observacao: e.target.value }))} />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleParticipacaoSave} className="px-6 py-3">Salvar Participação</Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3"><AlertTriangle className="text-amber-600" size={24} /> Pendências</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Etapas atrasadas</span>
                  <span className="font-bold text-slate-700">{unit.etapasAtrasadasCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tarefas vencidas</span>
                  <span className="font-bold text-slate-700">{unit.tarefasVencidasCount || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  {unit.temPendencias || unit.pendencias ? <StatusBadge label="Com Pendências" tone="amber" /> : <StatusBadge label="Regular" tone="emerald" />}
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3"><Award className="text-blue-600" size={24} /> Selos Ativos</h3>
              {selosConquistados.filter(selo => selo.ativo).length === 0 ? (
                <EmptyState title="Nenhum selo ativo" description="Recalcule os selos após atualizar tarefas ou etapas." icon={Award} />
              ) : (
                <div className="space-y-3">
                  {selosConquistados.filter(selo => selo.ativo).map(selo => {
                    const catalog = selosCatalog.find(item => item.id === selo.seloId);
                    return (
                      <div key={selo.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="font-bold text-slate-700">{catalog?.nome || 'Selo'}</p>
                        <p className="text-xs text-slate-500">{catalog?.descricao}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'etapas' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><Layers className="text-blue-600" size={24} /> Etapas de Maturidade</h3>
          <form onSubmit={handleAddEtapaCatalog} className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <input className="p-3 bg-white border border-slate-200 rounded-xl" placeholder="Código" value={etapaCatalogForm.codigo} onChange={e => setEtapaCatalogForm(prev => ({ ...prev, codigo: e.target.value }))} />
            <input className="md:col-span-2 p-3 bg-white border border-slate-200 rounded-xl" placeholder="Nome" value={etapaCatalogForm.nome} onChange={e => setEtapaCatalogForm(prev => ({ ...prev, nome: e.target.value }))} />
            <input className="md:col-span-2 p-3 bg-white border border-slate-200 rounded-xl" placeholder="Descrição" value={etapaCatalogForm.descricao} onChange={e => setEtapaCatalogForm(prev => ({ ...prev, descricao: e.target.value }))} />
            <input type="number" className="p-3 bg-white border border-slate-200 rounded-xl" placeholder="Ordem" value={etapaCatalogForm.ordem} onChange={e => setEtapaCatalogForm(prev => ({ ...prev, ordem: e.target.value }))} />
            <input type="number" className="p-3 bg-white border border-slate-200 rounded-xl" placeholder="Peso" value={etapaCatalogForm.peso} onChange={e => setEtapaCatalogForm(prev => ({ ...prev, peso: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input type="checkbox" checked={etapaCatalogForm.obrigatoria} onChange={e => setEtapaCatalogForm(prev => ({ ...prev, obrigatoria: e.target.checked }))} />
              Obrigatória
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input type="checkbox" checked={etapaCatalogForm.ativo} onChange={e => setEtapaCatalogForm(prev => ({ ...prev, ativo: e.target.checked }))} />
              Ativa
            </label>
            <div className="md:col-span-6 flex justify-end">
              <Button type="submit" className="px-6 py-3">Adicionar Etapa</Button>
            </div>
          </form>
          {etapasCatalog.length === 0 ? (
            <EmptyState title="Nenhuma etapa cadastrada" description="Cadastre etapas no catálogo para acompanhar o status." icon={Layers} />
          ) : (
            <div className="space-y-4">
              {etapasCatalog.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)).map(etapa => (
                <div key={etapa.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-slate-700">{etapa.nome}</h4>
                      <p className="text-sm text-slate-500">{etapa.descricao}</p>
                      {etapa.obrigatoria && <StatusBadge label="Obrigatória" tone="amber" />}
                    </div>
                    <Button variant="outline" className="px-4 py-2 text-sm" onClick={() => handleSaveEtapaStatus(etapa.id)}><CheckCircle size={16} /> Salvar</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
                      <select className="w-full p-3 bg-white border border-slate-200 rounded-xl" value={etapasDrafts[etapa.id]?.status || 'PENDENTE'} onChange={e => setEtapasDrafts(prev => ({ ...prev, [etapa.id]: { ...prev[etapa.id], status: e.target.value } }))}>
                        <option value="PENDENTE">Pendente</option>
                        <option value="EM_ANDAMENTO">Em andamento</option>
                        <option value="CONCLUIDA">Concluída</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data limite</label>
                      <input type="date" className="w-full p-3 bg-white border border-slate-200 rounded-xl" value={etapasDrafts[etapa.id]?.data_limite || ''} onChange={e => setEtapasDrafts(prev => ({ ...prev, [etapa.id]: { ...prev[etapa.id], data_limite: e.target.value } }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Conclusão</label>
                      <input type="date" className="w-full p-3 bg-white border border-slate-200 rounded-xl" value={etapasDrafts[etapa.id]?.data_conclusao || ''} onChange={e => setEtapasDrafts(prev => ({ ...prev, [etapa.id]: { ...prev[etapa.id], data_conclusao: e.target.value } }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Responsável</label>
                      <input className="w-full p-3 bg-white border border-slate-200 rounded-xl" value={etapasDrafts[etapa.id]?.responsavel || ''} onChange={e => setEtapasDrafts(prev => ({ ...prev, [etapa.id]: { ...prev[etapa.id], responsavel: e.target.value } }))} />
                    </div>
                    <div className="md:col-span-5">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Observação</label>
                      <textarea className="w-full p-3 bg-white border border-slate-200 rounded-xl" rows="2" value={etapasDrafts[etapa.id]?.observacao || ''} onChange={e => setEtapasDrafts(prev => ({ ...prev, [etapa.id]: { ...prev[etapa.id], observacao: e.target.value } }))} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'metas' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-4"><Target className="text-emerald-600" size={24} /> Catálogo de Metas</h3>
            <form onSubmit={handleAddMetaCatalog} className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <input className="p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Código" value={metaCatalogForm.codigo} onChange={e => setMetaCatalogForm(prev => ({ ...prev, codigo: e.target.value }))} />
              <input className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Nome" value={metaCatalogForm.nome} onChange={e => setMetaCatalogForm(prev => ({ ...prev, nome: e.target.value }))} />
              <input className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Descrição" value={metaCatalogForm.descricao} onChange={e => setMetaCatalogForm(prev => ({ ...prev, descricao: e.target.value }))} />
              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={metaCatalogForm.periodicidade} onChange={e => setMetaCatalogForm(prev => ({ ...prev, periodicidade: e.target.value }))}>
                <option value="MENSAL">Mensal</option>
                <option value="TRIMESTRAL">Trimestral</option>
                <option value="ANUAL">Anual</option>
              </select>
              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={metaCatalogForm.tipo} onChange={e => setMetaCatalogForm(prev => ({ ...prev, tipo: e.target.value }))}>
                <option value="QUANTITATIVA">Quantitativa</option>
                <option value="QUALITATIVA">Qualitativa</option>
              </select>
              <input type="number" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Peso" value={metaCatalogForm.peso} onChange={e => setMetaCatalogForm(prev => ({ ...prev, peso: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input type="checkbox" checked={metaCatalogForm.ativo} onChange={e => setMetaCatalogForm(prev => ({ ...prev, ativo: e.target.checked }))} />
                Ativa
              </label>
              <div className="md:col-span-6 flex justify-end">
                <Button type="submit" className="px-6 py-3">Adicionar Meta</Button>
              </div>
            </form>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-4"><Target className="text-blue-600" size={24} /> Metas Institucionais</h3>
            <form onSubmit={handleMetaSave} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={metaForm.metaId} onChange={e => setMetaForm(prev => ({ ...prev, metaId: e.target.value }))}>
                <option value="">Meta</option>
                {metasCatalog.map(meta => <option key={meta.id} value={meta.id}>{meta.nome}</option>)}
              </select>
              <input className="p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Período (YYYY-MM)" value={metaForm.periodo_referencia} onChange={e => setMetaForm(prev => ({ ...prev, periodo_referencia: e.target.value }))} />
              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={metaForm.status} onChange={e => setMetaForm(prev => ({ ...prev, status: e.target.value }))}>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="ATINGIDA">Atingida</option>
                <option value="NAO_ATINGIDA">Não atingida</option>
              </select>
              <input className="p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Responsável" value={metaForm.responsavel} onChange={e => setMetaForm(prev => ({ ...prev, responsavel: e.target.value }))} />
              <input className="p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Valor alvo" value={metaForm.valor_alvo} onChange={e => setMetaForm(prev => ({ ...prev, valor_alvo: e.target.value }))} />
              <input className="p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Valor real" value={metaForm.valor_real} onChange={e => setMetaForm(prev => ({ ...prev, valor_real: e.target.value }))} />
              <input type="date" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={metaForm.data_limite} onChange={e => setMetaForm(prev => ({ ...prev, data_limite: e.target.value }))} />
              <input type="date" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={metaForm.data_fechamento} onChange={e => setMetaForm(prev => ({ ...prev, data_fechamento: e.target.value }))} />
              <textarea className="md:col-span-4 p-3 bg-slate-50 border border-slate-200 rounded-xl" rows="2" placeholder="Observação" value={metaForm.observacao} onChange={e => setMetaForm(prev => ({ ...prev, observacao: e.target.value }))} />
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" className="px-6 py-3">{editingMetaId ? 'Atualizar Meta' : 'Adicionar Meta'}</Button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h4 className="text-lg font-bold text-slate-700 mb-4">Metas Registradas</h4>
            {metasStatus.length === 0 ? (
              <EmptyState title="Nenhuma meta registrada" description="Use o formulário acima para registrar metas." icon={Target} />
            ) : (
              <div className="space-y-4">
                {metasStatus.map(meta => {
                  const catalog = metasCatalog.find(item => item.id === meta.metaId);
                  return (
                    <div key={meta.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-700">{catalog?.nome || 'Meta'}</p>
                        <p className="text-xs text-slate-500">Período: {meta.periodo_referencia}</p>
                        <p className="text-xs text-slate-500">Responsável: {meta.responsavel || '-'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge label={meta.status} tone={meta.status === 'ATINGIDA' ? 'emerald' : meta.status === 'NAO_ATINGIDA' ? 'rose' : 'amber'} />
                        <button onClick={() => handleMetaEdit(meta)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                        <button onClick={() => handleMetaDelete(meta.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tarefas' && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-4"><CheckCircle className="text-blue-600" size={24} /> Tarefas da Unidade</h3>
            <form onSubmit={handleTarefaSave} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input className="p-3 bg-slate-50 border border-slate-200 rounded-xl md:col-span-2" placeholder="Título" value={tarefaForm.titulo} onChange={e => setTarefaForm(prev => ({ ...prev, titulo: e.target.value }))} />
              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={tarefaForm.prioridade} onChange={e => setTarefaForm(prev => ({ ...prev, prioridade: e.target.value }))}>
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={tarefaForm.status} onChange={e => setTarefaForm(prev => ({ ...prev, status: e.target.value }))}>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDA">Concluída</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
              <input type="date" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={tarefaForm.data_limite} onChange={e => setTarefaForm(prev => ({ ...prev, data_limite: e.target.value }))} />
              <input type="date" className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={tarefaForm.data_conclusao} onChange={e => setTarefaForm(prev => ({ ...prev, data_conclusao: e.target.value }))} />
              <input className="p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Responsável" value={tarefaForm.responsavel} onChange={e => setTarefaForm(prev => ({ ...prev, responsavel: e.target.value }))} />
              <select className="p-3 bg-slate-50 border border-slate-200 rounded-xl" value={tarefaForm.origem} onChange={e => setTarefaForm(prev => ({ ...prev, origem: e.target.value }))}>
                <option value="MANUAL">Manual</option>
                <option value="SISTEMA">Sistema</option>
              </select>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <input type="checkbox" checked={tarefaForm.penaliza_score} onChange={e => setTarefaForm(prev => ({ ...prev, penaliza_score: e.target.checked }))} />
                Penaliza score
              </label>
              <textarea className="md:col-span-4 p-3 bg-slate-50 border border-slate-200 rounded-xl" rows="2" placeholder="Descrição" value={tarefaForm.descricao} onChange={e => setTarefaForm(prev => ({ ...prev, descricao: e.target.value }))} />
              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" className="px-6 py-3">{editingTarefaId ? 'Atualizar Tarefa' : 'Adicionar Tarefa'}</Button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h4 className="text-lg font-bold text-slate-700 mb-4">Tarefas Registradas</h4>
            {tarefas.length === 0 ? (
              <EmptyState title="Nenhuma tarefa registrada" description="Use o formulário acima para registrar tarefas." icon={CheckCircle} />
            ) : (
              <div className="space-y-4">
                {tarefas.map(task => (
                  <div key={task.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-700">{task.titulo}</p>
                      <p className="text-xs text-slate-500">Responsável: {task.responsavel || '-'}</p>
                      {task.data_limite && <p className="text-xs text-slate-500">Limite: {toDate(task.data_limite)?.toLocaleDateString('pt-BR')}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge label={task.status} tone={task.status === 'CONCLUIDA' ? 'emerald' : task.status === 'CANCELADA' ? 'slate' : 'amber'} />
                      <StatusBadge label={task.prioridade} tone={task.prioridade === 'CRITICA' ? 'rose' : task.prioridade === 'ALTA' ? 'amber' : 'slate'} />
                      <button onClick={() => handleTarefaEdit(task)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                      <button onClick={() => handleTarefaDelete(task.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'selos' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><Trophy className="text-blue-600" size={24} /> Selos de Destaque</h3>
          <form onSubmit={handleAddSeloCatalog} className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-6 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
            <input className="p-3 bg-white border border-slate-200 rounded-xl" placeholder="Código" value={seloCatalogForm.codigo} onChange={e => setSeloCatalogForm(prev => ({ ...prev, codigo: e.target.value }))} />
            <input className="md:col-span-2 p-3 bg-white border border-slate-200 rounded-xl" placeholder="Nome" value={seloCatalogForm.nome} onChange={e => setSeloCatalogForm(prev => ({ ...prev, nome: e.target.value }))} />
            <input className="md:col-span-2 p-3 bg-white border border-slate-200 rounded-xl" placeholder="Descrição" value={seloCatalogForm.descricao} onChange={e => setSeloCatalogForm(prev => ({ ...prev, descricao: e.target.value }))} />
            <input type="number" className="p-3 bg-white border border-slate-200 rounded-xl" placeholder="Validade (dias)" value={seloCatalogForm.validade_dias} onChange={e => setSeloCatalogForm(prev => ({ ...prev, validade_dias: e.target.value }))} />
            <textarea className="md:col-span-5 p-3 bg-white border border-slate-200 rounded-xl" rows="2" placeholder="criterio_json" value={seloCatalogForm.criterio_json} onChange={e => setSeloCatalogForm(prev => ({ ...prev, criterio_json: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input type="checkbox" checked={seloCatalogForm.ativo} onChange={e => setSeloCatalogForm(prev => ({ ...prev, ativo: e.target.checked }))} />
              Ativo
            </label>
            <div className="md:col-span-6 flex justify-end">
              <Button type="submit" className="px-6 py-3">Adicionar Selo</Button>
            </div>
          </form>
          {selosCatalog.length === 0 ? (
            <EmptyState title="Nenhum selo cadastrado" description="Cadastre selos no catálogo para ativar a gamificação." icon={Trophy} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {selosCatalog.map(selo => {
                const conquistado = selosConquistados.find(item => item.seloId === selo.id && item.ativo);
                return (
                  <div key={selo.id} className={`p-6 rounded-3xl border ${conquistado ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-slate-700">{selo.nome}</h4>
                      {conquistado ? <StatusBadge label="Ativo" tone="emerald" /> : <StatusBadge label="Inativo" tone="slate" />}
                    </div>
                    <p className="text-sm text-slate-500">{selo.descricao}</p>
                    {conquistado && (
                      <p className="text-xs text-slate-500 mt-2">Expira: {conquistado.data_expira ? toDate(conquistado.data_expira)?.toLocaleDateString('pt-BR') : 'Sem expiração'}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BackupScreen = ({ units, showToast }) => {
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const payload = isMock ? mockDB.exportAll() : { units };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_asa_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Download iniciado!", "success");
  };

  const processImportData = async (data) => {
    const valid = data.filter(u => u.nomeUnidade);
    let count = 0;
    const checkPendency = (item) => (item.pendencias === true) || (getMissingFields(item).length > 0);

    if (isMock) {
        valid.forEach(item => { mockDB.add({ ...item, status: 'Ativo', pendencias: checkPendency(item) }); count++; });
        window.dispatchEvent(new Event('storage'));
    } else {
        for (const item of valid) {
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'asa_units'), where('nomeUnidade', '==', item.nomeUnidade));
          const snap = await getDocs(q);
          if (snap.empty) {
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'asa_units'), {
                ...item, status: 'Ativo', pendencias: checkPendency(item), createdAt: serverTimestamp(), updatedAt: serverTimestamp()
              });
              count++;
          }
        }
    }
    showToast(`${count} unidades importadas!`, "success");
  };

  const mapRow = (row) => {
      const norm = {}; Object.keys(row).forEach(k => norm[k.toUpperCase().trim()] = row[k]);
      let end = norm['ENDERECO'] || norm['ENDEREÇO'] || '';
      let num = norm['NUMERO'] || norm['NÚMERO'] || '';
      if (!num && typeof end === 'string' && end.includes(',')) {
          const parts = end.split(',').map(p => p.trim());
          const last = parts[parts.length - 1];
          if (/\d+/.test(last)) { num = last; end = parts.slice(0, -1).join(','); }
      }
      return {
          nomeUnidade: smartFormat(norm['NOME'] || norm['NOME DA UNIDADE'] || ''),
          nomeDiretor: smartFormat(norm['DIRETOR'] || norm['DIRETOR (A)'] || ''),
          cidade: smartFormat(norm['CIDADE'] || ''),
          bairro: smartFormat(norm['BAIRRO'] || ''),
          logradouro: smartFormat(end),
          numero: num,
          cep: norm['CEP'] || '',
          email: (norm['EMAIL'] || norm['E-MAIL'] || '').toLowerCase(),
          telefone: norm['TELEFONE'] || norm['CELULAR'] || '',
          anoEleicao: norm['MANDATO'] || norm['ANO'] || new Date().getFullYear(),
      };
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
        if (file.name.match(/\.(xlsx|xls)$/i)) {
            const XLSX = await loadSheetJS();
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const wb = XLSX.read(data, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const json = XLSX.utils.sheet_to_json(ws);
                    await processImportData(json.map(mapRow));
                } catch(err) { showToast('Erro planilha.', 'error'); } finally { setImporting(false); e.target.value = null; }
            };
            reader.readAsArrayBuffer(file);
        } else if (file.name.match(/\.json$/i)) {
             const reader = new FileReader();
             reader.onload = async (evt) => {
                 try {
                     const json = JSON.parse(evt.target.result);
                     if (isMock && mockDB.importAll(json)) {
                       showToast('Backup restaurado!', 'success');
                       window.dispatchEvent(new Event('storage'));
                     } else {
                       await processImportData(json.units || json.data || []);
                     }
                 } catch(err) { showToast('JSON inválido.', 'error'); } finally { setImporting(false); e.target.value = null; }
             };
             reader.readAsText(file);
        } else {
             const reader = new FileReader();
             reader.onload = async (evt) => {
                 try {
                     await processImportData(parseCSV(evt.target.result).map(mapRow));
                 } catch(err) { showToast('Erro CSV.', 'error'); } finally { setImporting(false); e.target.value = null; }
             };
             reader.readAsText(file, 'ISO-8859-1');
        }
    } catch (err) { showToast("Erro import.", "error"); setImporting(false); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
         <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600"><Download size={36}/></div>
         <h3 className="text-2xl font-bold text-slate-800 mb-3">Backup de Segurança</h3>
         <p className="text-slate-500 mb-8 text-lg leading-relaxed">Baixe uma cópia completa dos dados locais em JSON para guardar com segurança.</p>
         <Button onClick={handleExport} className="w-full">Baixar JSON</Button>
      </div>
      <div className="bg-white p-10 rounded-3xl border border-slate-200 relative">
         <h3 className="text-2xl font-bold text-slate-800 mb-3 flex gap-3"><Upload className="text-amber-600" size={32}/> Importar Dados</h3>
         <p className="text-slate-500 mb-8 text-lg leading-relaxed">Restaure um backup JSON completo ou importe planilha (.xlsx, .csv).</p>
         <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-blue-500 transition-colors z-0"></div>
            <div className="relative z-10 py-12 text-center">
                {importing ? <RefreshCw className="animate-spin mx-auto text-blue-600" size={48}/> : <FileSpreadsheet className="mx-auto text-slate-400 group-hover:text-blue-500 transition-colors" size={48}/>}
                <p className="mt-4 text-lg font-medium text-slate-600 group-hover:text-blue-600">{importing ? 'Processando...' : 'Clique para selecionar arquivo'}</p>
            </div>
            <input type="file" accept=".csv,.json,.xlsx,.xls" onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
         </div>
      </div>
    </div>
  );
};

// --- DASHBOARD (PRINCIPAL) ---
const Dashboard = ({ user, onLogout }) => {
  const getMenuKeyForPage = (page) => {
    if (['units_list', 'units_add'].includes(page)) return 'management';
    if (['asa_units', 'asa_unit_detail'].includes(page)) return 'asa';
    return null;
  };

  const availablePages = new Set([
    'dashboard',
    'units_list',
    'units_add',
    'asa_units',
    'asa_unit_detail',
    'unit_life',
    'map',
    'backup',
  ]);

  const initialActivePage = (() => {
    if (typeof window === 'undefined') return 'dashboard';
    const stored = localStorage.getItem('activePage') || 'dashboard';
    return availablePages.has(stored) ? stored : 'dashboard';
  })();

  const [activePage, setActivePage] = useState(initialActivePage);
  const [openMenuKey, setOpenMenuKey] = useState(() => getMenuKeyForPage(initialActivePage));
  const [units, setUnits] = useState([]);
  const [etapasCatalog, setEtapasCatalog] = useState([]);
  const [metasCatalog, setMetasCatalog] = useState([]);
  const [selosCatalog, setSelosCatalog] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMapUnit, setSelectedMapUnit] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const pageTitles = {
    dashboard: 'Visão Geral',
    units_list: 'Listagem de Unidades',
    units_add: 'Cadastro de Unidade',
    asa_units: 'Unidades ASA',
    asa_unit_detail: 'Detalhe da Unidade',
    unit_life: 'Vida da Unidade',
    map: 'Georreferenciamento',
    backup: 'Backup e Dados',
  };

  const initialForm = { nomeUnidade: '', nomeDiretor: '', regiao: '', distrito: '', anoEleicao: new Date().getFullYear(), email: '', telefone: '', cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '', viceDiretor: '', secretario: '', tesoureiro: '', pendencias: false, status: 'Ativo' };
  const [formData, setFormData] = useState(initialForm);
  const lastCepLookup = useRef('');
  const selectedUnit = units.find(unit => unit.id === selectedUnitId);

  const showToast = (msg, type = 'success') => { setToast({ show: true, message: msg, type }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activePage', activePage);
    }
    const menuKey = getMenuKeyForPage(activePage);
    setOpenMenuKey(menuKey);
  }, [activePage]);

  useEffect(() => {
    if (isMock) {
      const load = () => {
        mockDB.load();
        setUnits([...mockDB.units]);
      };
      load();
      const handleStorage = () => load();
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
    const q = query(getCollectionRef(COLLECTIONS.units), orderBy('nomeUnidade'));
    return onSnapshot(q, s => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => { console.error(e); });
  }, []);

  useEffect(() => {
    const seedSelosCatalog = async () => {
      if (isMock) {
        const current = mockDB.getCatalog(COLLECTIONS.selos);
        if (current.length === 0) {
          defaultSelosCatalog.forEach(item => mockDB.addCatalogDoc(COLLECTIONS.selos, item));
        }
        setSelosCatalog(mockDB.getCatalog(COLLECTIONS.selos));
      } else {
        const snapshot = await getDocs(getCollectionRef(COLLECTIONS.selos));
        if (snapshot.empty) {
          await Promise.all(defaultSelosCatalog.map(item => addDoc(getCollectionRef(COLLECTIONS.selos), item)));
        }
      }
    };

    const subscribeCatalogs = () => {
      if (isMock) {
        const loadCatalogs = () => {
          setEtapasCatalog(mockDB.getCatalog(COLLECTIONS.etapas));
          setMetasCatalog(mockDB.getCatalog(COLLECTIONS.metas));
          setSelosCatalog(mockDB.getCatalog(COLLECTIONS.selos));
        };
        loadCatalogs();
        const handleStorage = () => loadCatalogs();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
      }
      const unsubEtapas = onSnapshot(getCollectionRef(COLLECTIONS.etapas), snapshot => {
        setEtapasCatalog(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      const unsubMetas = onSnapshot(getCollectionRef(COLLECTIONS.metas), snapshot => {
        setMetasCatalog(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      const unsubSelos = onSnapshot(getCollectionRef(COLLECTIONS.selos), snapshot => {
        setSelosCatalog(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      });
      return () => {
        unsubEtapas();
        unsubMetas();
        unsubSelos();
      };
    };

    seedSelosCatalog();
    return subscribeCatalogs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const missing = getMissingFields(formData);
      const dataToSave = { 
        ...formData, 
        pendencias: missing.length > 0 || formData.pendencias,
        scoreAtual: formData.scoreAtual ?? 0,
        scoreEtapas: formData.scoreEtapas ?? 0,
        scoreMetas: formData.scoreMetas ?? 0,
        scoreRegularidade: formData.scoreRegularidade ?? 0,
        scoreDocumentacao: formData.scoreDocumentacao ?? 0,
        scoreParticipacao: formData.scoreParticipacao ?? 0,
        classificacaoAtual: formData.classificacaoAtual ?? 'CRITICA',
        temPendencias: formData.temPendencias ?? false,
        tarefasVencidasCount: formData.tarefasVencidasCount ?? 0,
        etapasAtrasadasCount: formData.etapasAtrasadasCount ?? 0,
        updatedAt: isMock ? new Date().toISOString() : serverTimestamp()
      };
      if (isMock) { editingId ? mockDB.update(editingId, dataToSave) : mockDB.add(dataToSave); }
      else {
        const ref = editingId ? getDocRef(COLLECTIONS.units, editingId) : getCollectionRef(COLLECTIONS.units);
        editingId ? (delete dataToSave.id, await updateDoc(ref, dataToSave)) : (dataToSave.createdAt = serverTimestamp(), await addDoc(ref, dataToSave));
      }
      showToast(editingId ? "Atualizado!" : "Cadastrado!"); setFormData(initialForm); setEditingId(null); setActivePage('units_list');
    } catch { showToast("Erro ao salvar", "error"); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Confirmar exclusão?")) {
      isMock ? mockDB.delete(id) : await deleteDoc(getDocRef(COLLECTIONS.units, id));
      showToast("Excluído!");
    }
  };

  const togglePending = async (unit) => {
    isMock ? mockDB.update(unit.id, { pendencias: !unit.pendencias }) : await updateDoc(getDocRef(COLLECTIONS.units, unit.id), { pendencias: !unit.pendencias });
    showToast("Status alterado");
  };

  const handleCepLookup = async (cepValue) => {
    const clean = String(cepValue).replace(/\D/g, '');
    if (clean.length !== 8 || clean === lastCepLookup.current) return;
    lastCepLookup.current = clean;
    const addr = await fetchAddressByCEP(clean);
    if (addr) {
      setFormData(p => ({ ...p, logradouro: addr.logradouro, bairro: addr.bairro, cidade: addr.localidade, uf: addr.uf }));
      showToast("Endereço preenchido!");
    }
  };

  const handleCepBlur = async () => {
    await handleCepLookup(formData.cep);
  };

  const handleCepChange = (e) => {
    const masked = maskCEP(e.target.value);
    setFormData(prev => ({ ...prev, cep: masked }));
    handleCepLookup(masked);
  };

  const stats = {
    total: units.length,
    outdated: units.filter(u => isOutdated(u.updatedAt)).length,
    pending: units.filter(u => u.temPendencias || u.pendencias).length,
    actions: units.reduce((a, b) => a + (parseInt(b.acoesRealizadas)||0), 0)
  };

  const filteredMapUnits = units.filter(u => String(u.nomeUnidade).toLowerCase().includes(searchTerm.toLowerCase()));
  const handleNameFormat = (e) => setFormData(prev => ({...prev, nomeUnidade: smartFormat(e.target.value)}));
  const handleDirectorNameFormat = (e) => setFormData(prev => ({...prev, nomeDiretor: smartFormat(e.target.value)}));
  const refreshMockCatalogs = () => {
    if (isMock) {
      setEtapasCatalog(mockDB.getCatalog(COLLECTIONS.etapas));
      setMetasCatalog(mockDB.getCatalog(COLLECTIONS.metas));
      setSelosCatalog(mockDB.getCatalog(COLLECTIONS.selos));
    }
  };

  return (
    <div className="h-screen-safe bg-slate-50 text-slate-800 font-sans overflow-hidden flex text-lg">
      <TailwindInjector />
      <Toast {...toast} onClose={() => setToast({...toast, show: false})} />
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white flex flex-col shrink-0 transition-transform duration-300 shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-10 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl"><ShieldCheck size={32} className="text-white" /></div>
            <div><div className="font-bold text-2xl leading-none">Ação Solidária Adventista</div></div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400"><X size={32}/></button>
        </div>
        <nav className="flex-1 p-8 space-y-3 overflow-y-auto">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 ml-4">MENU PRINCIPAL</p>
          <SidebarItem icon={LayoutDashboard} label="Visão Geral" isActive={activePage === 'dashboard'} onClick={() => { setActivePage('dashboard'); setSidebarOpen(false); }} />
          <SidebarItem
            icon={Building2}
            label="Cadastros"
            hasSubmenu
            isOpen={openMenuKey === 'management'}
            isActive={openMenuKey === 'management' || ['units_list', 'units_add'].includes(activePage)}
            onClick={() => setOpenMenuKey(prev => (prev === 'management' ? null : 'management'))}
          />
          {openMenuKey === 'management' && (
            <div className="pl-6 space-y-2 mt-2 border-l-2 border-slate-700 ml-8">
              <SubMenuItem label="Listagem" isActive={activePage === 'units_list'} onClick={() => { setActivePage('units_list'); setSidebarOpen(false); }} />
              <SubMenuItem label="Unidade" isActive={activePage === 'units_add'} onClick={() => { setFormData(initialForm); setEditingId(null); setActivePage('units_add'); setSidebarOpen(false); }} />
            </div>
          )}
          <SidebarItem
            icon={Award}
            label="ASA"
            hasSubmenu
            isOpen={openMenuKey === 'asa'}
            isActive={openMenuKey === 'asa' || ['asa_units', 'asa_unit_detail'].includes(activePage)}
            onClick={() => setOpenMenuKey(prev => (prev === 'asa' ? null : 'asa'))}
          />
          {openMenuKey === 'asa' && (
            <div className="pl-6 space-y-2 mt-2 border-l-2 border-slate-700 ml-8">
              <SubMenuItem label="Unidades" isActive={activePage === 'asa_units' || activePage === 'asa_unit_detail'} onClick={() => { setActivePage('asa_units'); setSidebarOpen(false); }} />
            </div>
          )}
          <SidebarItem icon={HeartHandshake} label="Vida da Unidade" isActive={activePage === 'unit_life'} onClick={() => { setActivePage('unit_life'); setSidebarOpen(false); }} />
          <SidebarItem icon={MapIcon} label="Georreferenciamento" isActive={activePage === 'map'} onClick={() => { setActivePage('map'); setSidebarOpen(false); }} />
          <div className="pt-8">
             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 ml-4">Dados</p>
             <SidebarItem icon={Database} label="Backup e Dados" isActive={activePage === 'backup'} onClick={() => { setActivePage('backup'); setSidebarOpen(false); }} />
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-full md:ml-80 relative overflow-hidden bg-slate-50">
        <header className="bg-white border-b px-8 md:px-12 py-6 flex justify-between items-center shrink-0 shadow-sm z-40 h-24">
          <div className="flex items-center gap-6">
             <button onClick={() => setSidebarOpen(true)} className="md:hidden text-slate-600 p-2 rounded-xl hover:bg-slate-100"><Menu size={32}/></button>
             <div className="flex items-center gap-4">
               <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shadow-sm">
                 <HeartHandshake size={26} strokeWidth={2.4} />
               </div>
               <div className="flex flex-col">
                 <h1 className="font-bold text-3xl text-slate-800 capitalize tracking-tight">
                   {activePage === 'asa_unit_detail' && selectedUnit ? selectedUnit.nomeUnidade : pageTitles[activePage] ?? activePage.replace(/_/g, ' ')}
                 </h1>
                 <span className="text-sm font-semibold text-slate-400">Versão {APP_VERSION}</span>
               </div>
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-base font-semibold text-slate-500 flex items-center gap-3 bg-slate-100 px-5 py-2.5 rounded-full shadow-inner">
               <span className="text-emerald-600 flex items-center gap-2"><Cloud size={20}/> Online</span>
             </div>
             <button onClick={onLogout} className="text-base text-red-600 hover:text-white border-2 border-red-200 hover:bg-red-600 font-bold px-6 py-2.5 rounded-xl transition-all duration-200">Sair</button>
          </div>
        </header>

        <div className="app-content flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
          {activePage === 'dashboard' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total de Unidades" value={stats.total} icon={Building2} color="bg-blue-600" />
                <StatCard title="Ações Realizadas" value={stats.actions} icon={Users} color="bg-emerald-500" />
                <StatCard title="Pendências" value={stats.pending} icon={AlertTriangle} color="bg-amber-500" />
                <StatCard title="Desatualizadas" value={stats.outdated} icon={Clock} color="bg-rose-500" />
              </div>
              <UnitDashboardScreen units={units} showToast={showToast} />
            </div>
          )}

          {activePage === 'asa_units' && (
            <UnitsManagementScreen
              units={units}
              onSelectUnit={(unitId) => { setSelectedUnitId(unitId); setActivePage('asa_unit_detail'); }}
            />
          )}

          {activePage === 'asa_unit_detail' && selectedUnit && (
            <UnitDetailScreen
              unit={selectedUnit}
              etapasCatalog={etapasCatalog}
              metasCatalog={metasCatalog}
              selosCatalog={selosCatalog}
              showToast={showToast}
              onBack={() => { setActivePage('asa_units'); setSelectedUnitId(null); }}
              onCatalogRefresh={refreshMockCatalogs}
            />
          )}

          {activePage === 'units_list' && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-8 font-bold text-slate-600 text-sm uppercase tracking-widest">Unidade / Local</th>
                      <th className="p-8 font-bold text-slate-600 text-sm uppercase tracking-widest">Direção / Contato</th>
                      <th className="p-8 font-bold text-slate-600 text-sm uppercase tracking-widest text-center">Ano Eleição</th>
                      <th className="p-8 font-bold text-slate-600 text-sm uppercase tracking-widest text-center">Status</th>
                      <th className="p-8 font-bold text-slate-600 text-sm uppercase tracking-widest text-right">Gerenciar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {units.map(u => (
                      <tr key={u.id} className="hover:bg-blue-50/40 transition-colors group">
                        <td className="p-8">
                          <div className="font-bold text-slate-900 text-xl mb-2">{safeRender(u.nomeUnidade)}</div>
                          <div className="text-base text-slate-500 flex items-center gap-2"><MapPin size={18}/> {safeRender(u.cidade)}</div>
                        </td>
                        <td className="p-8">
                          <div className="text-lg font-medium text-slate-700 mb-2">{safeRender(u.nomeDiretor)}</div>
                          <div className="text-base text-slate-400 flex items-center gap-2">
                            {getWhatsappLink(u.telefone) ? (
                              <a
                                href={getWhatsappLink(u.telefone)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 transition-colors"
                                aria-label="Abrir conversa no WhatsApp"
                              >
                                <Phone size={18}/>
                              </a>
                            ) : (
                              <Phone size={18}/>
                            )}
                            {safeRender(u.telefone)}
                          </div>
                        </td>
                        <td className="p-8 text-center font-bold">
                          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full border text-sm font-bold ${getAnoEleicaoBadge(u.anoEleicao)}`}>
                            {safeRender(u.anoEleicao)}
                          </span>
                        </td>
                        <td className="p-8 text-center">
                          <button onClick={() => togglePending(u)} className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all shadow-sm hover:shadow-md ${u.pendencias ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                            {u.pendencias ? 'Pendente' : 'Regular'}
                          </button>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-4">
                            <button onClick={() => { setFormData({ ...initialForm, ...u }); setEditingId(u.id); setActivePage('units_add'); }} className="text-blue-600 p-3 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"><Edit size={24}/></button>
                            <button onClick={() => handleDelete(u.id)} className="text-red-600 p-3 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"><Trash2 size={24}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === 'units_add' && (
            <div className="max-w-6xl mx-auto pb-12">
              <form onSubmit={handleSave} className="space-y-10">
                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600"></div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-10 flex items-center gap-4 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600"><Building2 size={32}/></div> Identificação da Unidade
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="md:col-span-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Nome da Unidade <span className="text-red-500">*</span></label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold text-xl text-slate-800" required
                        value={formData.nomeUnidade} onChange={handleNameFormat} placeholder="Ex: ASA Central..." />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Região</label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-lg font-medium" 
                        value={formData.regiao} onChange={e => setFormData({...formData, regiao: smartFormat(e.target.value)})} placeholder="Região" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Distrito</label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-lg font-medium" 
                        value={formData.distrito} onChange={e => setFormData({...formData, distrito: smartFormat(e.target.value)})} placeholder="Distrito" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Status Operacional</label>
                      <select className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-lg font-medium" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option>Ativo</option><option>Inativo</option><option>Em Formação</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-amber-500"></div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-10 flex items-center gap-4 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-amber-100 rounded-xl text-amber-600"><MapPin size={32}/></div> Localização Geográfica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-3">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">CEP <span className="text-red-500">*</span></label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none font-mono text-lg font-medium" 
                        value={formData.cep} onChange={handleCepChange} onBlur={handleCepBlur} placeholder="00000-000" />
                    </div>
                    <div className="md:col-span-7">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Endereço (Logradouro)</label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-lg font-medium" 
                        value={formData.logradouro} onChange={e => setFormData({...formData, logradouro: smartFormat(e.target.value)})} placeholder="Rua, Avenida..." />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Número</label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-lg font-medium" 
                        value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Bairro</label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-lg font-medium" 
                        value={formData.bairro} onChange={e => setFormData({...formData, bairro: smartFormat(e.target.value)})} />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Cidade</label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-lg font-medium" 
                        value={formData.cidade} onChange={e => setFormData({...formData, cidade: smartFormat(e.target.value)})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">UF</label>
                      <input className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-100 focus:border-amber-500 outline-none text-lg font-bold uppercase text-center" maxLength={2} 
                        value={formData.uf} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} />
                    </div>
                  </div>
                </div>

                {/* Liderança */}
                <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-600"></div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-10 flex items-center gap-4 pb-6 border-b border-slate-100">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><Users size={32}/></div> Liderança e Contato
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="md:col-span-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Nome do Diretor(a) <span className="text-red-500">*</span></label>
                      <div className="relative">
                         <div className="absolute left-5 top-5 text-slate-400"><Users size={24}/></div>
                         <input className="w-full p-5 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none font-bold text-xl text-slate-800" required
                           value={formData.nomeDiretor} onChange={e => setFormData({...formData, nomeDiretor: smartFormat(e.target.value)})} placeholder="Nome completo" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Telefone / WhatsApp</label>
                      <div className="relative">
                         <div className="absolute left-5 top-5 text-slate-400"><Phone size={24}/></div>
                         <input className="w-full p-5 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-lg font-medium" 
                           value={formData.telefone} onChange={e => setFormData({...formData, telefone: maskPhone(e.target.value)})} placeholder="(00) 00000-0000" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">E-mail de Contato</label>
                      <div className="relative">
                         <div className="absolute left-5 top-5 text-slate-400"><Mail size={24}/></div>
                         <input className="w-full p-5 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-lg font-medium" 
                           value={formData.email} onChange={e => setFormData({...formData, email: e.target.value.toLowerCase()})} placeholder="exemplo@email.com" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Ano da Eleição</label>
                      <div className="relative">
                         <div className="absolute left-5 top-5 text-slate-400"><Calendar size={24}/></div>
                         <input type="number" className="w-full p-5 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-lg font-medium" required
                           value={formData.anoEleicao} onChange={e => setFormData({...formData, anoEleicao: e.target.value})} placeholder="2025" />
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-4">
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Equipe da Diretoria (opcional)</p>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Vice Diretor(a)</label>
                      <div className="relative">
                         <div className="absolute left-5 top-5 text-slate-400"><User size={24}/></div>
                         <input className="w-full p-5 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-lg font-medium"
                           value={formData.viceDiretor} onChange={e => setFormData({...formData, viceDiretor: smartFormat(e.target.value)})} placeholder="Nome completo" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Secretário(a)</label>
                      <div className="relative">
                         <div className="absolute left-5 top-5 text-slate-400"><User size={24}/></div>
                         <input className="w-full p-5 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-lg font-medium"
                           value={formData.secretario} onChange={e => setFormData({...formData, secretario: smartFormat(e.target.value)})} placeholder="Nome completo" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 block">Tesoureiro(a)</label>
                      <div className="relative">
                         <div className="absolute left-5 top-5 text-slate-400"><User size={24}/></div>
                         <input className="w-full p-5 pl-14 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none text-lg font-medium"
                           value={formData.tesoureiro} onChange={e => setFormData({...formData, tesoureiro: smartFormat(e.target.value)})} placeholder="Nome completo" />
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-2">
                      <label className="flex items-center gap-4 p-5 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-amber-200 cursor-pointer transition-all group">
                        <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${formData.pendencias ? 'bg-amber-500 border-amber-500' : 'border-slate-300 group-hover:border-amber-400 bg-white'}`}>
                          {formData.pendencias && <Check size={20} className="text-white" strokeWidth={3} />}
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={formData.pendencias}
                          onChange={e => setFormData({...formData, pendencias: e.target.checked})}
                        />
                        <span className="text-lg font-semibold text-slate-700 group-hover:text-slate-900">Marcar manualmente esta unidade como "Com Pendência"</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-6 pt-8 border-t border-slate-200">
                  <Button variant="outline" type="button" onClick={() => setActivePage('units_list')} className="px-10 py-5 text-lg">Cancelar Operação</Button>
                  <Button type="submit" className="px-12 py-5 text-lg shadow-xl shadow-blue-900/20">{editingId ? 'Salvar Alterações' : 'Finalizar Cadastro'}</Button>
                </div>
              </form>
            </div>
          )}

          {activePage === 'unit_life' && <UnitLifeScreen units={units} showToast={showToast} />}
          {activePage === 'backup' && <BackupScreen units={units} showToast={showToast} />}

          {activePage === 'map' && (
            <div className="flex flex-col md:flex-row h-full rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-white">
              <div className="w-full md:w-96 bg-white border-r border-slate-100 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="p-8 border-b border-slate-100">
                   <h2 className="font-bold text-2xl text-slate-800 mb-1">Mapa de Unidades</h2>
                   <p className="text-base text-slate-500 mb-6">Localize rapidamente qualquer unidade.</p>
                   <div className="relative">
                      <Search className="absolute left-5 top-4 text-slate-400" size={22}/>
                      <input placeholder="Buscar cidade ou nome..." className="w-full pl-14 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-lg text-slate-700 transition-all placeholder:font-normal" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                   </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                  {units.filter(u => String(u.nomeUnidade).toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                    <div key={u.id} onClick={() => setSelectedMapUnit(u)} className={`p-5 rounded-2xl cursor-pointer transition-all hover:shadow-md border-2 ${selectedMapUnit?.id === u.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-900/30 scale-[1.02]' : 'bg-white border-white hover:border-blue-200 text-slate-600'}`}>
                      <div className={`font-bold text-lg mb-2 ${selectedMapUnit?.id === u.id ? 'text-white' : 'text-slate-800'}`}>{safeRender(u.nomeUnidade)}</div>
                      <div className={`text-base flex items-center gap-2 ${selectedMapUnit?.id === u.id ? 'text-blue-100' : 'text-slate-500'}`}><MapPin size={18}/> {safeRender(u.cidade)}</div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-slate-100 bg-white">
                   <Button className="w-full py-5 text-base font-bold shadow-lg shadow-blue-900/10" onClick={() => window.open(`https://www.google.com/maps/search/Ação+Solidaria+Adventista+${units.map(u => u.cidade).join('+OR+')}`, '_blank')}>
                      <ExternalLink size={20}/> Abrir Mapa Global no Google
                   </Button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 relative min-h-[600px]">
                {selectedMapUnit ? (
                  <iframe title="map" width="100%" height="100%" frameBorder="0" style={{ filter: 'grayscale(0.1)' }} src={`https://maps.google.com/maps?q=${encodeURIComponent(`${selectedMapUnit.logradouro}, ${selectedMapUnit.numero}, ${selectedMapUnit.cidade}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}></iframe>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-slate-50/50 backdrop-blur-sm">
                     <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 text-slate-300"><MapPin size={48}/></div>
                     <h3 className="text-2xl font-bold text-slate-700">Selecione uma unidade</h3>
                     <p className="max-w-xs mt-3 text-lg text-slate-500 font-medium">Clique na lista ao lado para ver a localização no mapa.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

// --- APP (INICIALIZAÇÃO) ---
const App = () => {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem(LOCAL_USER_KEY));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = (email) => {
    const nextUser = { email, loggedInAt: new Date().toISOString() };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  return user ? <Dashboard user={user} onLogout={handleLogout} /> : <LoginScreen onLogin={handleLogin} loading={loading} />;
};

export default App;

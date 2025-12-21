/**
 * SISTEMA DE GESTÃO ASA (Ação Solidária Adventista)
 * =================================================
 * Versão: 4.4 (Tela de Login Premium & Moderna)
 * Tecnologias: React, Tailwind CSS, Firebase (Firestore/Auth), Lucide Icons.
 */

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { 
  ShieldCheck, LayoutDashboard, Building2, Users, LogOut, Plus, Trash2, Search, Map as MapIcon, 
  AlertTriangle, Menu, X, ChevronDown, ChevronRight, Phone, Mail, MapPin, Edit, CheckCircle, 
  Clock, Database, Download, Upload, RefreshCw, Cloud, Check, Calendar, AlertOctagon, 
  ExternalLink, FileSpreadsheet, Locate, HeartHandshake, FileText, Award, Layers, DollarSign,
  Star, Medal, Trophy, Lock, User
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
   2. CONFIGURAÇÃO DO BANCO DE DADOS
   ===================================================================
*/
const PROD_FIREBASE_CONFIG = null; 

const getEnvVar = (name) => typeof window !== 'undefined' && window[name] ? window[name] : undefined;
let db, auth;
let isMock = false;

try {
  if (PROD_FIREBASE_CONFIG) {
    const app = initializeApp(PROD_FIREBASE_CONFIG);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    const envConfig = getEnvVar('__firebase_config');
    if (envConfig) {
      const config = JSON.parse(envConfig);
      if (!config.apiKey || config.apiKey === 'demo') throw new Error("Chave Demo");
      const app = initializeApp(config);
      auth = getAuth(app);
      db = getFirestore(app);
    } else {
      throw new Error("Sem config");
    }
  }
} catch (e) {
  isMock = true;
}

const appId = getEnvVar('__app_id') || 'default-app-id';
const initialToken = getEnvVar('__initial_auth_token');

const mockDB = {
  units: [],
  unitLife: {}, 
  load: () => { 
    try { 
      mockDB.units = JSON.parse(localStorage.getItem('asa_units_mock') || '[]'); 
      mockDB.unitLife = JSON.parse(localStorage.getItem('asa_life_mock') || '{}');
    } catch { mockDB.units = []; mockDB.unitLife = {}; } 
  },
  save: () => {
    localStorage.setItem('asa_units_mock', JSON.stringify(mockDB.units));
    localStorage.setItem('asa_life_mock', JSON.stringify(mockDB.unitLife));
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
    if (isMock) {
        setLifeData(mockDB.getLife(selectedUnitId));
    } else {
        const saved = localStorage.getItem(`life_${selectedUnitId}`);
        if(saved) setLifeData(JSON.parse(saved));
        else setLifeData({ docs: '', reports: '', team: '', structure: '', finance: '', excellenceByMonth: {} });
    }
  }, [selectedUnitId]);

  const handleSaveLife = () => {
      if(!selectedUnitId) return;
      if(isMock) mockDB.updateLife(selectedUnitId, lifeData);
      else localStorage.setItem(`life_${selectedUnitId}`, JSON.stringify(lifeData));
      showToast("Dados da Vida da Unidade salvos!", "success");
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

const BackupScreen = ({ units, showToast }) => {
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ units }, null, 2)], { type: 'application/json' });
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
                     await processImportData(json.units || json.data || []);
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
         <p className="text-slate-500 mb-8 text-lg leading-relaxed">Baixe uma cópia completa dos dados para segurança.</p>
         <Button onClick={handleExport} className="w-full">Baixar JSON</Button>
      </div>
      <div className="bg-white p-10 rounded-3xl border border-slate-200 relative">
         <h3 className="text-2xl font-bold text-slate-800 mb-3 flex gap-3"><Upload className="text-amber-600" size={32}/> Importar Dados</h3>
         <p className="text-slate-500 mb-8 text-lg leading-relaxed">Carregue planilha (.xlsx, .csv) ou backup.</p>
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
  const [activePage, setActivePage] = useState('dashboard');
  const [menuState, setMenuState] = useState({ management: true });
  const [units, setUnits] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMapUnit, setSelectedMapUnit] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const pageTitles = {
    dashboard: 'Visão Geral',
    units_list: 'Listagem de Unidades',
    units_add: 'Cadastro de Unidade',
    unit_life: 'Vida da Unidade',
    map: 'Georreferenciamento',
    backup: 'Backup e Dados',
  };

  const initialForm = { nomeUnidade: '', nomeDiretor: '', anoEleicao: new Date().getFullYear(), email: '', telefone: '', cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '', viceDiretor: '', secretario: '', tesoureiro: '', pendencias: false, status: 'Ativo' };
  const [formData, setFormData] = useState(initialForm);
  const lastCepLookup = useRef('');

  const showToast = (msg, type = 'success') => { setToast({ show: true, message: msg, type }); setTimeout(() => setToast(p => ({ ...p, show: false })), 3000); };

  useEffect(() => {
    if (isMock) {
      const load = () => setUnits([...mockDB.units]); load();
      const interval = setInterval(() => {
        const current = JSON.parse(localStorage.getItem('asa_units_mock') || '[]');
        if(current.length !== units.length) setUnits(current);
      }, 2000);
      return () => clearInterval(interval);
    }
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'asa_units'), orderBy('nomeUnidade'));
    return onSnapshot(q, s => setUnits(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => { console.error(e); isMock = true; });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const missing = getMissingFields(formData);
      const dataToSave = { ...formData, pendencias: missing.length > 0 || formData.pendencias, updatedAt: isMock ? new Date().toISOString() : serverTimestamp() };
      if (isMock) { editingId ? mockDB.update(editingId, dataToSave) : mockDB.add(dataToSave); }
      else {
        const ref = editingId ? doc(db, 'artifacts', appId, 'public', 'data', 'asa_units', editingId) : collection(db, 'artifacts', appId, 'public', 'data', 'asa_units');
        editingId ? (delete dataToSave.id, await updateDoc(ref, dataToSave)) : (dataToSave.createdAt = serverTimestamp(), await addDoc(ref, dataToSave));
      }
      showToast(editingId ? "Atualizado!" : "Cadastrado!"); setFormData(initialForm); setEditingId(null); setActivePage('units_list');
    } catch { showToast("Erro ao salvar", "error"); }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Confirmar exclusão?")) {
      isMock ? mockDB.delete(id) : await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'asa_units', id));
      showToast("Excluído!");
    }
  };

  const togglePending = async (unit) => {
    isMock ? mockDB.update(unit.id, { pendencias: !unit.pendencias }) : await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'asa_units', unit.id), { pendencias: !unit.pendencias });
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
    pending: units.filter(u => u.pendencias).length,
    actions: units.reduce((a, b) => a + (parseInt(b.acoesRealizadas)||0), 0)
  };

  const filteredMapUnits = units.filter(u => String(u.nomeUnidade).toLowerCase().includes(searchTerm.toLowerCase()));
  const handleNameFormat = (e) => setFormData(prev => ({...prev, nomeUnidade: smartFormat(e.target.value)}));
  const handleDirectorNameFormat = (e) => setFormData(prev => ({...prev, nomeDiretor: smartFormat(e.target.value)}));

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
          <SidebarItem icon={Building2} label="Cadastros" hasSubmenu isOpen={menuState.management} onClick={() => setMenuState(p => ({...p, management: !p.management}))} />
          {menuState.management && (
            <div className="pl-6 space-y-2 mt-2 border-l-2 border-slate-700 ml-8">
              <SubMenuItem label="Listagem" isActive={activePage === 'units_list'} onClick={() => { setActivePage('units_list'); setSidebarOpen(false); }} />
              <SubMenuItem label="Unidade" isActive={activePage === 'units_add'} onClick={() => { setFormData(initialForm); setEditingId(null); setActivePage('units_add'); setSidebarOpen(false); }} />
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
             <h1 className="font-bold text-3xl text-slate-800 capitalize tracking-tight">
               {pageTitles[activePage] ?? activePage.replace(/_/g, ' ')}
             </h1>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-base font-semibold text-slate-500 flex items-center gap-3 bg-slate-100 px-5 py-2.5 rounded-full shadow-inner">
               {isMock ? <span className="text-amber-600 flex items-center gap-2"><AlertTriangle size={20}/> Offline</span> : <span className="text-emerald-600 flex items-center gap-2"><Cloud size={20}/> Online</span>}
             </div>
             <button onClick={onLogout} className="text-base text-red-600 hover:text-white border-2 border-red-200 hover:bg-red-600 font-bold px-6 py-2.5 rounded-xl transition-all duration-200">Sair</button>
          </div>
        </header>

        <div className="app-content flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
          {activePage === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard title="Total de Unidades" value={stats.total} icon={Building2} color="bg-blue-600" />
              <StatCard title="Ações Realizadas" value={stats.actions} icon={Users} color="bg-emerald-500" />
              <StatCard title="Pendências" value={stats.pending} icon={AlertTriangle} color="bg-amber-500" />
              <StatCard title="Desatualizadas" value={stats.outdated} icon={Clock} color="bg-rose-500" />
            </div>
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
                          <div className="text-base text-slate-400 flex items-center gap-2"><Phone size={18}/> {safeRender(u.telefone)}</div>
                        </td>
                        <td className="p-8 text-center font-bold text-slate-700">
                          {safeRender(u.anoEleicao)}
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMock) {
      setUser({ uid: 'mock-user' });
      setLoading(false);
      return;
    }
    const initAuth = async () => {
      try {
        if (initialToken) await signInWithCustomToken(auth, initialToken);
        else await signInAnonymously(auth);
      } catch (e) {
        isMock = true; 
        mockDB.load();
        setUser({ uid: 'mock-user' });
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-900"></div></div>;

  return user ? <Dashboard user={user} onLogout={() => { if(!isMock) signOut(auth); window.location.reload(); }} /> : <LoginScreen onLogin={() => setLoading(true)} loading={loading} />;
};

export default App;

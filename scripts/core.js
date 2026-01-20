/* Arquivo: core.js
   Função: Contém componentes reutilizáveis (Header, Login, Icons) e gerenciamento de estado global (localStorage).
*/

const { useState, useEffect, useRef } = React;

// --- DADOS INICIAIS ---
const preLoadedUnits = [
    { id: 1, name: 'ASA Alto Umuarama', city: 'Uberlândia', director: 'Carmem Lamounier', phone: '(34) 99166-3300', neighborhood: 'Alto Umuarama', address: 'Rua Paulo Frontin', number: '1321', zipcode: '', email: '', state: 'MG', region: 'Leste', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.9100, lng: -48.2350 },
    { id: 2, name: 'ASA Bela Vista', city: 'Canápolis', director: 'Maria Aparecida da Silva Tavares - Nina', phone: '(34) 99722-4833', neighborhood: 'Bela Vista', address: 'Rua 8', number: '1098', zipcode: '38.380-000', email: 'nina.sita@hotmail.com', state: 'MG', region: '', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.7233, lng: -49.2047 },
    { id: 3, name: 'ASA Boa Vista', city: 'Araxá', director: 'Monica Maria Silva Santiago', phone: '(34) 99932-3490', neighborhood: 'Boa Vista', address: 'Rua Augusto Alves', number: '306', zipcode: '', email: '', state: 'MG', region: '', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -19.5933, lng: -46.9406 },
    { id: 4, name: 'ASA Buritis', city: 'Uberlândia', director: 'Maria Amelia Pereira da Silva', phone: '(34) 99287-1002', neighborhood: 'Buritis', address: 'Rua Petronilha Rodrigues de Queiroz', number: '110', zipcode: '', email: '', state: 'MG', region: 'Sul', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.9500, lng: -48.2800 },
    { id: 5, name: 'ASA Canaã', city: 'Uberlândia', director: 'Maria Aparecida Odilon Bezerra', phone: '(34) 99922-2246', neighborhood: 'Canaã', address: 'Av. Babel', number: '653', zipcode: '', email: '', state: 'MG', region: 'Oeste', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.9300, lng: -48.3000 },
    { id: 24, name: 'ASA Morada Nova', city: 'Uberlândia', director: 'Lucielena Balbina de Jesus', phone: '(34) 99699-9707', neighborhood: 'Morada Nova', address: 'Rua Benedita da Silva Santos', number: '153', zipcode: '', email: '', state: 'MG', region: 'Oeste', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.8800, lng: -48.3500 },
    { id: 25, name: 'ASA Morumbi', city: 'Uberlândia', director: 'Lucas Cipriano Mendes', phone: '(34) 99835-9449', neighborhood: 'Morumbi', address: 'Rua Taperas', number: '339', zipcode: '', email: '', state: 'MG', region: 'Leste', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.9200, lng: -48.2200 },
    { id: 38, name: 'ASA Nova Serrana', city: 'Nova Serrana', director: 'Ana Lucia Barbosa de Matos', phone: '(37) 99142-2552', neighborhood: 'Romeu Duarte', address: 'Rua Divino Ferreira', number: '736', zipcode: '35.519-000', email: '', state: 'MG', region: '', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -19.8700, lng: -44.9800 },
    { id: 26, name: 'ASA Panorama', city: 'Uberlândia', director: '', phone: '', neighborhood: 'Panorama', address: 'Rua das Espatódias', number: '858', zipcode: '', email: '', state: 'MG', region: 'Oeste', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.9400, lng: -48.3100 },
    { id: 28, name: 'ASA Pequis', city: 'Uberlândia', director: 'Yedros Modesto Rezende', phone: '(34) 99892-2018', neighborhood: 'Pequis', address: 'Av. Wilson Rodrigues da Silva', number: '630 LJ 6', zipcode: '', email: 'sosmanutencoesuberlandia@gmail.com', state: 'MG', region: 'Oeste', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.8900, lng: -48.3600 },
    { id: 29, name: 'ASA Roosevelt', city: 'Uberlândia', director: 'Maria Regina Cardoso', phone: '(34) 99239-9352', neighborhood: 'Roosevelt', address: 'Rua Virgilio Mineiro', number: '25', zipcode: '', email: '', state: 'MG', region: 'Norte', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.9000, lng: -48.2900 },
    { id: 30, name: 'ASA Santa Mônica', city: 'Uberlândia', director: 'Ana', phone: '(34) 9999-9999', neighborhood: 'Santa Mônica', address: 'Av. Segismundo Pereira', number: '1200', zipcode: '', email: '', state: 'MG', region: 'Leste', electionYear: 2024, lastUpdated: new Date().toISOString().split('T')[0], lat: -18.9150, lng: -48.2500 }
];

// --- FUNÇÕES DE SUPORTE ---
const loadState = (key, fallback) => {
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : fallback; } catch (e) { return fallback; }
};

const formatTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
        if (word.toUpperCase() === 'ASA') return 'ASA';
        if (/^(da|de|do|das|dos|e)$/.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

// --- ÍCONES (Biblioteca Lucide) ---
const Icons = {
    // ... Todos os seus ícones SVG aqui para não poluir os arquivos HTML ...
    // Para simplificar a resposta, incluirei os principais usados. Adicione o restante conforme o código anterior.
    LayoutGrid: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
    Database: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    LogOut: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    Sun: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
    Moon: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 0 1 1-9-9Z"/></svg>,
    ChevronDown: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
    Lock: (p) => <svg {...p} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    // ... Adicione os outros ícones do código anterior (MapPin, Phone, etc) aqui ...
};

// --- COMPONENTES COMPARTILHADOS ---

// Componente: Header (Menu Principal)
const Header = ({ activePage }) => {
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('asa_theme') === 'dark');

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('asa_theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('asa_theme', 'light');
        }
    }, [darkMode]);

    const handleLogout = () => {
        sessionStorage.removeItem('asa_auth');
        window.location.reload();
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-green-600 dark:border-green-900 sticky top-0 z-50 no-print shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href='dashboard.html'}>
                    <img src="../img/asa.jpg" alt="ASA" className="h-10 w-auto rounded object-contain" onError={(e)=>{e.target.onerror=null;e.target.src="https://via.placeholder.com/40?text=ASA"}}/>
                    <div><h1 className="text-xl font-bold dark:text-white text-green-800">Monitoramento ASA</h1></div>
                </div>
                <nav className="hidden md:flex gap-6 items-center">
                    <a href="dashboard.html" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activePage === 'dashboard' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>Dashboard</a>
                    
                    <div className="relative group">
                        <button className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${['units','unit_life','structure','mgmt'].includes(activePage) ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            Gestão de Unidades <Icons.ChevronDown size={14}/>
                        </button>
                        <div className="dropdown-menu bg-white dark:bg-gray-800 hidden group-hover:block border border-gray-100 dark:border-gray-700">
                            <a href="unidades.html" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700">Lista de Unidades</a>
                            <a href="vidaunidade.html" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700">Vida da Unidade</a>
                            <a href="estrutura.html" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700">Estrutura & ID</a>
                            <a href="gestaointerna.html" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700">Gestão Interna</a>
                        </div>
                    </div>

                    <div className="relative group">
                        <button className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${['distribution','files','map'].includes(activePage) ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
                            Operacional <Icons.ChevronDown size={14}/>
                        </button>
                        <div className="dropdown-menu bg-white dark:bg-gray-800 hidden group-hover:block border border-gray-100 dark:border-gray-700">
                            <a href="distribuicao.html" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700">Distribuição</a>
                            <a href="arquivos.html" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700">Arquivos</a>
                            <a href="mapa.html" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700">Mapa Geral</a>
                        </div>
                    </div>
                </nav>
                <div className="flex gap-2">
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">{darkMode ? <Icons.Sun size={20}/> : <Icons.Moon size={20}/>}</button>
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-2"><Icons.LogOut size={18}/></button>
                </div>
            </div>
        </header>
    );
};

// Componente: Tela de Login
const LoginScreen = ({ onLogin }) => {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (ev) => {
        ev.preventDefault();
        if(u === 'adm' && p === 'adm') onLogin();
        else setError('Credenciais inválidas');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 bg-gradient-to-br from-green-500/20 to-blue-500/20">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="hidden md:block w-1/2 bg-cover bg-center relative" style={{backgroundImage: "url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"}}>
                    <div className="absolute inset-0 bg-green-900/40 flex flex-col justify-end p-8 text-white">
                        <h3 className="text-2xl font-bold mb-2">Unidos para Servir</h3>
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex justify-center mb-6"><img src="../img/asa.jpg" alt="ASA Logo" className="h-24 w-auto object-contain" onError={(e)=>{e.target.onerror=null;e.target.src="https://via.placeholder.com/150x80?text=ASA+Logo"}} /></div>
                    <div className="text-center mb-8"><h2 className="text-2xl font-bold text-gray-800 dark:text-white">Acesso Restrito</h2></div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input type="text" value={u} onChange={(e)=>setU(e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Usuário" />
                        <input type="password" value={p} onChange={(e)=>setP(e.target.value)} className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 dark:text-white" placeholder="Senha" />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700">Entrar</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
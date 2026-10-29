import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitialData } from './src/services/taskApi.js';
import { 
  LayoutDashboard, 
  Kanban as KanbanIcon, 
  Table as TableIcon, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  CheckSquare, 
  Tag, 
  User, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  Briefcase, 
  Layers,
  ArrowRight,
  HelpCircle,
  X,
  Check
} from 'lucide-react';

// Dados iniciais de exemplo caso o localStorage esteja vazio
const DEFAULT_WORKSPACES = [
  {
    id: 'ws-1',
    name: 'Produto & Engenharia',
    projects: [
      { id: 'proj-1', name: 'Lançamento V2.0', icon: '🚀' },
      { id: 'proj-2', name: 'Refatoração do Core', icon: '⚡' }
    ]
  },
  {
    id: 'ws-2',
    name: 'Marketing & Growth',
    projects: [
      { id: 'proj-3', name: 'Campanha Q3', icon: '📈' }
    ]
  }
];

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Desenvolver novo sistema de autenticação',
    description: 'Implementar login social e autenticação baseada em JWT com refresh token seguro.',
    status: 'em_andamento', // 'a_fazer', 'em_andamento', 'concluido'
    priority: 'urgente', // 'baixa', 'media', 'alta', 'urgente'
    dueDate: '2026-06-15',
    assignee: 'Carlos Silva',
    tags: ['Backend', 'Segurança'],
    checklist: [
      { id: 'cl-1', text: 'Configurar provedores OAuth', completed: true },
      { id: 'cl-2', text: 'Criar rotas de Refresh Token', completed: false },
      { id: 'cl-3', text: 'Testes unitários de auth', completed: false }
    ]
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Redesenhar tela de checkout',
    description: 'Atualizar os componentes visuais para o novo Design System com Tailwind CSS.',
    status: 'a_fazer',
    priority: 'alta',
    dueDate: '2026-06-20',
    assignee: 'Mariana Souza',
    tags: ['Frontend', 'UI/UX'],
    checklist: [
      { id: 'cl-4', text: 'Criar wireframes no Figma', completed: true },
      { id: 'cl-5', text: 'Implementar componentes responsivos', completed: false }
    ]
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Revisão de segurança de dados (LGPD)',
    description: 'Garantir criptografia de ponta e política de exclusão de dados dos usuários ativos.',
    status: 'concluido',
    priority: 'media',
    dueDate: '2026-06-01',
    assignee: 'Ana Paula',
    tags: ['Legal', 'Segurança'],
    checklist: [
      { id: 'cl-6', text: 'Mapeamento de dados sensíveis', completed: true },
      { id: 'cl-7', text: 'Atualizar termos de uso', completed: true }
    ]
  }
];

export default function TaskManagerApp({ initialView = 'kanban' }) {
  const navigate = useNavigate();
  // Estados principais
  const [workspaces, setWorkspaces] = useState(() => {
    const saved = localStorage.getItem('tm_workspaces');
    return saved ? JSON.parse(saved) : DEFAULT_WORKSPACES;
  });
  const [hasSavedWorkspaces] = useState(() => Boolean(localStorage.getItem('tm_workspaces')));

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tm_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });
  const [hasSavedTasks] = useState(() => Boolean(localStorage.getItem('tm_tasks')));

  const [currentWorkspaceId, setCurrentWorkspaceId] = useState('ws-1');
  const [currentProjectId, setCurrentProjectId] = useState('proj-1');
  const activeView = initialView;
  const setActiveView = (view) => navigate(`/${view}`);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('todas');
  
  // Modais
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notification, setNotification] = useState(null);

  // Salvar no localStorage sempre que houver alterações
  useEffect(() => {
    localStorage.setItem('tm_workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('tm_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    let active = true;

    async function loadApiData() {
      try {
        const [apiWorkspaces, apiTasks] = await getInitialData();

        if (!active) return;
        if (!hasSavedWorkspaces && apiWorkspaces.length > 0) setWorkspaces(apiWorkspaces);
        if (!hasSavedTasks && apiTasks.length > 0) setTasks(apiTasks);
      } catch (error) {
        console.info('Usando dados locais de demonstração:', error);
      }
    }

    loadApiData();
    return () => {
      active = false;
    };
  }, []);

  // Verificar primeira vez para onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('tm_onboarded');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Exibir notificações temporárias elegantes
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3500);
  };

  const closeOnboarding = () => {
    localStorage.setItem('tm_onboarded', 'true');
    setShowOnboarding(false);
    showToast('Bem-vindo à plataforma! Aproveite para gerenciar suas tarefas.');
  };

  // Carregar template rápido do onboarding
  const loadTemplate = (templateType) => {
    if (templateType === 'sprint') {
      const newWs = { id: `ws-${Date.now()}`, name: 'Desenvolvimento Ágil', projects: [{ id: `proj-${Date.now()}`, name: 'Sprint 14 - Produto', icon: '🚀' }] };
      setWorkspaces([...workspaces, newWs]);
      setCurrentWorkspaceId(newWs.id);
      setCurrentProjectId(newWs.projects[0].id);
    } else {
      const newWs = { id: `ws-${Date.now()}`, name: 'Planejamento Pessoal', projects: [{ id: `proj-${Date.now()}`, name: 'Metas Semanais', icon: '🎯' }] };
      setWorkspaces([...workspaces, newWs]);
      setCurrentWorkspaceId(newWs.id);
      setCurrentProjectId(newWs.projects[0].id);
    }
    closeOnboarding();
  };

  // Filtragem de tarefas para o projeto atual
  const currentProjectTasks = tasks.filter(t => t.projectId === currentProjectId).filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTagFilter === 'todas' || t.tags.includes(selectedTagFilter);
    return matchesSearch && matchesTag;
  });

  // Estatísticas rápidas
  const totalTasks = currentProjectTasks.length;
  const completedTasks = currentProjectTasks.filter(t => t.status === 'concluido').length;
  const inProgressTasks = currentProjectTasks.filter(t => t.status === 'em_andamento').length;
  const pendingTasks = currentProjectTasks.filter(t => t.status === 'a_fazer').length;
  const overdueTasks = currentProjectTasks.filter(t => {
    if (t.status === 'concluido') return false;
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate < today;
  }).length;

  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];
  const currentProject = currentWorkspace?.projects.find(p => p.id === currentProjectId) || currentWorkspace?.projects[0];

  // Cores de prioridade
  const priorityColors = {
    baixa: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200',
    media: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200',
    alta: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200',
    urgente: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200'
  };

  return (
    <div className={`${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} min-h-screen flex flex-col md:flex-row font-sans transition-colors duration-200`}>
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* SIDEBAR DE NAVEGAÇÃO */}
      <aside className="w-full md:w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo / Header da Aplicação */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight leading-none">TaskFlow</h1>
                <span className="text-xs text-slate-400 font-medium">Gestão Inteligente</span>
              </div>
            </div>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Alternar Tema"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Seletor de Espaços de Trabalho e Projetos */}
          <div className="p-4 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Espaços de Trabalho</span>
              </div>
              <div className="space-y-1">
                {workspaces.map(ws => (
                  <div key={ws.id} className="space-y-1">
                    <button 
                      onClick={() => {
                        setCurrentWorkspaceId(ws.id);
                        if (ws.projects.length > 0) setCurrentProjectId(ws.projects[0].id);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        currentWorkspaceId === ws.id 
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Briefcase className="w-4 h-4 shrink-0" />
                        <span className="truncate">{ws.name}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${currentWorkspaceId === ws.id ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Projetos internos do workspace */}
                    {currentWorkspaceId === ws.id && (
                      <div className="pl-6 space-y-1 my-1">
                        {ws.projects.map(proj => (
                          <button
                            key={proj.id}
                            onClick={() => setCurrentProjectId(proj.id)}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              currentProjectId === proj.id
                                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{proj.icon}</span>
                            <span className="truncate">{proj.name}</span>
                          </button>
                        ))}
                        <button 
                          onClick={() => {
                            const name = prompt('Nome do novo projeto:');
                            if (name) {
                              const newProj = { id: `proj-${Date.now()}`, name, icon: '📁' };
                              const updatedWs = workspaces.map(w => w.id === ws.id ? {...w, projects: [...w.projects, newProj]} : w);
                              setWorkspaces(updatedWs);
                              setCurrentProjectId(newProj.id);
                              showToast('Projeto criado com sucesso!');
                            }
                          }}
                          className="w-full text-left px-3 py-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 mt-1"
                        >
                          <Plus className="w-3 h-3" /> Adicionar projeto
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navegação por Visões (Abas) */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 block">Visualizações</span>
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveView('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard & Métricas</span>
                </button>
                <button 
                  onClick={() => setActiveView('kanban')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeView === 'kanban' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <KanbanIcon className="w-4 h-4" />
                  <span>Quadro Kanban</span>
                </button>
                <button 
                  onClick={() => setActiveView('tabela')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeView === 'tabela' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <TableIcon className="w-4 h-4" />
                  <span>Visão Tabela / Lista</span>
                </button>
                <button 
                  onClick={() => setActiveView('calendario')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeView === 'calendario' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Calendário</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Sidebar com Onboarding / Ajuda */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setShowOnboarding(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Guia & Templates de Início</span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Barra Superior */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            <span className="text-xl">{currentProject?.icon || '📁'}</span>
            <div className="truncate">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base truncate">{currentProject?.name}</h2>
              <p className="text-xs text-slate-400 truncate">{currentWorkspace?.name} / {currentProject?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Barra de Pesquisa */}
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar tarefas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 lg:w-64 border-none text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Botão Nova Tarefa */}
            <button 
              onClick={() => {
                setEditingTask(null);
                setShowTaskModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Tarefa</span>
            </button>
          </div>
        </header>

        {/* Área de Visualização Dinâmica */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          
          {/* 1. VISÃO DASHBOARD */}
          {activeView === 'dashboard' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10 max-w-xl">
                  <span className="bg-white/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Visão Geral do Projeto</span>
                  <h2 className="text-3xl font-extrabold mt-3 tracking-tight">Bom trabalho no projeto {currentProject?.name}!</h2>
                  <p className="text-indigo-100 text-sm mt-2">Você concluiu {completedTasks} de {totalTasks} tarefas programadas. Mantenha o ritmo das entregas e verifique os prazos pendentes.</p>
                </div>
              </div>

              {/* Cards de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                    {totalTasks}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Total de Tarefas</span>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalTasks} itens</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                    {inProgressTasks}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Em Andamento</span>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{inProgressTasks} tarefas</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                    {completedTasks}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Concluídas</span>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{completedTasks} prontas</h3>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
                    {overdueTasks}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Atrasadas</span>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{overdueTasks} alertas</h3>
                  </div>
                </div>
              </div>

              {/* Seção de Tarefas Urgentes ou Recentes */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" /> Tarefas Urgentes e Prioritárias
                </h3>
                {currentProjectTasks.filter(t => t.priority === 'urgente' || t.priority === 'alta').length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">Nenhuma tarefa urgente no momento. Excelente!</p>
                ) : (
                  <div className="space-y-3">
                    {currentProjectTasks.filter(t => t.priority === 'urgente' || t.priority === 'alta').map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${task.status === 'concluido' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{task.title}</h4>
                            <p className="text-[10px] text-slate-400">Prazo: {task.dueDate} • Resp: {task.assignee}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-bold border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. VISÃO KANBAN */}
          {activeView === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
              {[
                { id: 'a_fazer', title: 'A Fazer', color: 'bg-slate-400' },
                { id: 'em_andamento', title: 'Em Andamento', color: 'bg-amber-500' },
                { id: 'concluido', title: 'Concluído', color: 'bg-emerald-500' }
              ].map(col => {
                const colTasks = currentProjectTasks.filter(t => t.status === col.id);
                return (
                  <div key={col.id} className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 flex flex-col max-h-[calc(100vh-10rem)]">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${col.color}`}></span>
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">{col.title}</h3>
                        <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full font-bold">
                          {colTasks.length}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingTask({ status: col.id, projectId: currentProjectId, priority: 'media', tags: ['Geral'], checklist: [] });
                          setShowTaskModal(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                      {colTasks.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                          <p className="text-xs text-slate-400">Nenhuma tarefa nesta coluna</p>
                        </div>
                      ) : (
                        colTasks.map(task => {
                          const completedChecklist = task.checklist ? task.checklist.filter(c => c.completed).length : 0;
                          const totalChecklist = task.checklist ? task.checklist.length : 0;
                          return (
                            <div 
                              key={task.id} 
                              className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug">{task.title}</h4>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => {
                                      setEditingTask(task);
                                      setShowTaskModal(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                                        setTasks(tasks.filter(t => t.id !== task.id));
                                        showToast('Tarefa excluída');
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description}</p>

                              {/* Tags */}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {task.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Checklist Progress se houver */}
                              {totalChecklist > 0 && (
                                <div className="flex items-center gap-2 mb-3 text-[10px] text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-lg">
                                  <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                                  <span>{completedChecklist}/{totalChecklist} subtarefas</span>
                                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ml-2">
                                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(completedChecklist/totalChecklist)*100}%` }}></div>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                                <span className={`px-2 py-0.5 rounded-md font-bold border ${priorityColors[task.priority]}`}>
                                  {task.priority}
                                </span>
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                                  <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300"><User className="w-3 h-3" /> {task.assignee}</span>
                                </div>
                              </div>

                              {/* Botões rápidos para mover de coluna */}
                              <div className="mt-3 flex items-center justify-between gap-1 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
                                {col.id !== 'a_fazer' && (
                                  <button 
                                    onClick={() => {
                                      const nextStatus = col.id === 'concluido' ? 'em_andamento' : 'a_fazer';
                                      setTasks(tasks.map(t => t.id === task.id ? {...t, status: nextStatus} : t));
                                    }}
                                    className="text-[10px] text-slate-500 hover:text-indigo-600 font-semibold"
                                  >
                                    ← Voltar
                                  </button>
                                )}
                                <div className="ml-auto">
                                  {col.id !== 'concluido' && (
                                    <button 
                                      onClick={() => {
                                        const nextStatus = col.id === 'a_fazer' ? 'em_andamento' : 'concluido';
                                        setTasks(tasks.map(t => t.id === task.id ? {...t, status: nextStatus} : t));
                                      }}
                                      className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                                    >
                                      Avançar →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. VISÃO TABELA / LISTA */}
          {activeView === 'tabela' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Lista Detalhada de Tarefas</h3>
                <span className="text-xs text-slate-400 font-medium">{currentProjectTasks.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4">Título</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Prioridade</th>
                      <th className="p-4">Responsável</th>
                      <th className="p-4">Prazo</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentProjectTasks.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">Nenhuma tarefa encontrada.</td>
                      </tr>
                    ) : (
                      currentProjectTasks.map(task => (
                        <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                            {task.title}
                            <p className="text-[11px] font-normal text-slate-400 truncate max-w-xs">{task.description}</p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              task.status === 'concluido' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                              task.status === 'em_andamento' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded font-bold border text-[10px] uppercase ${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{task.assignee}</td>
                          <td className="p-4 text-slate-500 dark:text-slate-400">{task.dueDate}</td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => {
                                setEditingTask(task);
                                setShowTaskModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mr-1"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Excluir esta tarefa?')) {
                                  setTasks(tasks.filter(t => t.id !== task.id));
                                  showToast('Tarefa excluída');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. VISÃO CALENDÁRIO */}
          {activeView === 'calendario' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">Cronograma Mensal</h3>
                  <p className="text-xs text-slate-400">Visualização de prazos e entregas do mês corrente</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-xl text-xs font-bold">
                  Junho 2026
                </div>
              </div>

              {/* Grid simples do calendário */}
              <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, idx) => (
                  <div key={idx} className="text-center font-bold text-xs text-slate-400 py-2">{day}</div>
                ))}
                {Array.from({ length: 30 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const dateStr = `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                  const dayTasks = currentProjectTasks.filter(t => t.dueDate === dateStr);

                  return (
                    <div key={idx} className="min-h-[100px] bg-slate-50 dark:bg-slate-800/30 rounded-xl p-2 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between">
                      <span className={`text-xs font-bold ${dayNum === 15 ? 'bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-500'}`}>
                        {dayNum}
                      </span>
                      <div className="space-y-1 mt-1 overflow-y-auto max-h-20">
                        {dayTasks.map(t => (
                          <div key={t.id} className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold p-1 rounded truncate" title={t.title}>
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE TAREFA */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                {editingTask?.id ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
              </h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const title = formData.get('title');
              const description = formData.get('description');
              const priority = formData.get('priority');
              const status = formData.get('status');
              const dueDate = formData.get('dueDate');
              const assignee = formData.get('assignee');
              const tagInput = formData.get('tags');
              const tags = tagInput ? tagInput.split(',').map(t => t.trim()) : ['Geral'];

              if (editingTask?.id) {
                // Editar
                setTasks(tasks.map(t => t.id === editingTask.id ? {
                  ...t, title, description, priority, status, dueDate, assignee, tags
                } : t));
                showToast('Tarefa atualizada com sucesso!');
              } else {
                // Criar
                const newTask = {
                  id: `task-${Date.now()}`,
                  projectId: currentProjectId,
                  title,
                  description,
                  priority,
                  status: status || 'a_fazer',
                  dueDate: dueDate || new Date().toISOString().split('T')[0],
                  assignee: assignee || 'Equipe',
                  tags,
                  checklist: [
                    { id: `cl-${Date.now()}`, text: 'Revisar requisitos', completed: false }
                  ]
                };
                setTasks([...tasks, newTask]);
                showToast('Nova tarefa criada com sucesso!');
              }
              setShowTaskModal(false);
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título da Tarefa</label>
                <input 
                  type="text" 
                  name="title" 
                  defaultValue={editingTask?.title || ''}
                  required 
                  placeholder="Ex: Implementar API de pagamentos" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição</label>
                <textarea 
                  name="description" 
                  defaultValue={editingTask?.description || ''}
                  rows="3" 
                  placeholder="Descreva os detalhes da tarefa..." 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select 
                    name="status" 
                    defaultValue={editingTask?.status || 'a_fazer'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="a_fazer">A Fazer</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Prioridade</label>
                  <select 
                    name="priority" 
                    defaultValue={editingTask?.priority || 'media'}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Vencimento</label>
                  <input 
                    type="date" 
                    name="dueDate" 
                    defaultValue={editingTask?.dueDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Responsável</label>
                  <input 
                    type="text" 
                    name="assignee" 
                    defaultValue={editingTask?.assignee || 'Carlos Silva'}
                    placeholder="Nome do responsável" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tags (separadas por vírgula)</label>
                <input 
                  type="text" 
                  name="tags" 
                  defaultValue={editingTask?.tags ? editingTask.tags.join(', ') : 'Backend, API'}
                  placeholder="Ex: Frontend, UI, Urgente" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowTaskModal(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE ONBOARDING / BOAS-VINDAS */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 mb-6">
              <Sparkles className="w-8 h-8" />
            </div>

            <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Bem-vindo ao TaskFlow</span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-3 tracking-tight">Sua nova central de produtividade</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-8">
              Gerencie quadros Kanban, liste tarefas em tabelas, acompanhe prazos no calendário e organize sua rotina com eficiência máxima. Escolha um template abaixo para começar instantaneamente:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => loadTemplate('sprint')}
                className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all group"
              >
                <div className="text-xl mb-2">🚀</div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Sprint de Produto</h4>
                <p className="text-xs text-slate-400 mt-1">Ideal para equipes de desenvolvimento e metodologias ágeis.</p>
              </button>

              <button 
                onClick={() => loadTemplate('pessoal')}
                className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-600 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 text-left transition-all group"
              >
                <div className="text-xl mb-2">🎯</div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Planejamento Pessoal</h4>
                <p className="text-xs text-slate-400 mt-1">Perfeito para organizar metas semanais, estudos e rotinas.</p>
              </button>
            </div>

            <button 
              onClick={closeOnboarding}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all"
            >
              Explorar meu painel vazio
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
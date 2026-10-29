# TaskFlow

Aplicação React para gestão de tarefas, com Vite, Tailwind CSS, React Router e API REST local baseada em JSON Server.

## Requisitos

- Node.js 20.19+ ou 22.12+
- npm

## Executar

```bash
npm install
npm run dev
```

O Vite inicia em `http://localhost:5173` e a API em `http://localhost:3001`. A interface usa o proxy `/api` do Vite para consultar a API. Também é possível iniciar cada serviço separadamente com `npm run dev:web` e `npm run dev:api`.

Para gerar uma versão de produção, use `npm run build`; para servir o resultado localmente, use `npm run preview`.

## Rotas

- `/dashboard`: métricas do projeto
- `/kanban`: quadro de tarefas
- `/tabela`: lista detalhada
- `/calendario`: calendário de prazos

## Os 11 conceitos

1. **JSX:** interface escrita em JSX no componente principal.
2. **Componentes:** `App`, `TaskManagerApp` e a raiz React são componentes funcionais.
3. **Props:** `initialView` configura a visão exibida pelo componente principal.
4. **Virtual DOM:** o React atualiza a interface a partir das mudanças de estado.
5. **Listas e keys:** coleções de projetos, tarefas e opções usam `map()` com `key`.
6. **Renderização condicional:** as visões e estados vazios aparecem conforme as condições.
7. **State e useState:** estado mantém tarefas, filtros, modais e preferências.
8. **Formulários:** o formulário de tarefa valida campos obrigatórios e processa submissões.
9. **useEffect:** persiste dados, carrega a API e sincroniza o onboarding.
10. **Consumo de APIs:** `src/services/taskApi.js` carrega as coleções do JSON Server; `db.json` fornece os dados iniciais. Se a API estiver indisponível, a interface mantém os dados locais de demonstração.
11. **React Router:** as quatro visões têm URLs próprias e navegação direta.

## Estrutura

```text
src/
  services/taskApi.js  # acesso à API
  App.jsx              # rotas
  main.jsx             # inicialização React
  index.css            # Tailwind e estilos base
db.json                # dados da API local
```
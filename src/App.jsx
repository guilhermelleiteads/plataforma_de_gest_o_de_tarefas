import { Navigate, Route, Routes } from 'react-router-dom';
import TaskManagerApp from '../plataforma_de_gest_o_de_tarefas.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/kanban" replace />} />
      <Route path="/dashboard" element={<TaskManagerApp initialView="dashboard" />} />
      <Route path="/kanban" element={<TaskManagerApp initialView="kanban" />} />
      <Route path="/tabela" element={<TaskManagerApp initialView="tabela" />} />
      <Route path="/calendario" element={<TaskManagerApp initialView="calendario" />} />
      <Route path="*" element={<Navigate to="/kanban" replace />} />
    </Routes>
  );
}
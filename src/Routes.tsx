import { Navigate, Route, Routes as Switch } from 'react-router-dom';

import { Login } from './pages/auth/Login';
import { Tasks } from './pages/tasks/Tasks';
import { NotFound } from './pages/NotFound';

export default function Routes() {
  return (
    <Switch>
      <Route path="*" element={<Navigate to="/not-found" replace />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/" element={<Login />} />
      <Route path="/tasks" element={<Tasks />} />
    </Switch>
  );
}

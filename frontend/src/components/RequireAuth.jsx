import { Navigate, Outlet } from 'react-router-dom';

function RequireAuth() {
  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export default RequireAuth;

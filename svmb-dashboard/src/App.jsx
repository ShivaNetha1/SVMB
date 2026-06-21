import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import NewClient from './pages/NewClient';
import Matches from './pages/Matches';
import Payments from './pages/Payments';
import ActivityLog from './pages/ActivityLog';

function DashboardLayout({ children }) {
  return (
    <>
      <Sidebar />
      <main className="page-container">{children}</main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Overview />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/new" element={<NewClient />} />
                  <Route path="/clients/:id" element={<ClientDetail />} />
                  <Route path="/matches" element={<Matches />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/log" element={<ActivityLog />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

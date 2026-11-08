import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import MyTicketsPage from './pages/MyTicketsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

import DashboardPage from './pages/admin/DashboardPage';
import ManageMoviesPage from './pages/admin/ManageMoviesPage';
import ManageRoomsPage from './pages/admin/ManageRoomsPage';
import ManageShowtimesPage from './pages/admin/ManageShowtimesPage';

const App = () => (
  <Routes>
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/movies/:id" element={<MovieDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute roles={['member', 'admin']} />}>
        <Route path="/showtimes/:id/seats" element={<SeatSelectionPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="movies" element={<ManageMoviesPage />} />
        <Route path="rooms" element={<ManageRoomsPage />} />
        <Route path="showtimes" element={<ManageShowtimesPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;

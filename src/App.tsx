import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './AuthContext';
import NeuralNetworkBg from './assets/components/NeuralNetworkBg';
import SplashScreen from './assets/components/SplashScreen';
import Login from './assets/components/Login';
import RegistrationForm from './assets/components/RegistrationForm';
import AdminDashboard from './assets/components/AdminDashboard';
import TeamDetail from './assets/components/TeamDetail';
import ProtectedRoute from './assets/components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NeuralNetworkBg />
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/register"
            element={
              <ProtectedRoute adminOnly={false}>
                <RegistrationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team/:teamName"
            element={
              <ProtectedRoute adminOnly={true}>
                <TeamDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        {/* Global Sound Effects */}
        <audio id="sfx-transform" src="https://www.myinstants.com/media/sounds/transformers.mp3"></audio>
        <audio id="sfx-click" src="https://www.myinstants.com/media/sounds/robot-interface-hit.mp3"></audio>
      </AuthProvider>
    </Router>
  );
}

export default App;

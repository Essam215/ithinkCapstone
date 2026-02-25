import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { MyTasks } from "./pages/MyTasks";
import { AddTask } from "./pages/AddTask";
import { Events } from "./pages/Events";
import { Leaderboard } from "./pages/Leaderboard";
import { Profile } from "./pages/Profile";
import { Admin } from "./pages/Admin";
import { PHPMembers } from "./pages/PHPMembers";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/my-tasks" element={<MyTasks />} />
                      <Route path="/add-task" element={<AddTask />} />
                      <Route path="/php-members" element={<PHPMembers />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route
                        path="/admin"
                        element={
                          <AdminProtectedRoute>
                            <Admin />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

function WaveAnimation() {
  return (
    <div className="wave-container">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          key={index}
          className={`wave wave-$
            {['small', 'medium', 'large'][Math.floor(Math.random() * 3)]} 
            wave-color-${Math.floor(Math.random() * 5) + 1}`}
          style={{ animationDelay: `${Math.random() * 5}s` }}
        ></div>
      ))}
    </div>
  );
}

function CommunityBox() {
  return (
    <div className="bg-white shadow-lg p-4 rounded-md">
      <h2 className="text-xl font-bold">Share something with the community</h2>
      <p className="text-gray-600">Let others know what you're working on!</p>
    </div>
  );
}

export { WaveAnimation, CommunityBox };

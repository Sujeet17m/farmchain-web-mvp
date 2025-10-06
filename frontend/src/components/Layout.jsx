import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserIcon,
  CubeIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = {
    farmer: [
      { name: 'Dashboard', href: '/farmer/dashboard', icon: HomeIcon },
      { name: 'My Batches', href: '/farmer/batches', icon: CubeIcon },
      { name: 'Profile', href: '/profile', icon: UserIcon },
    ],
    verifier: [
      { name: 'Dashboard', href: '/verifier/dashboard', icon: HomeIcon },
      { name: 'Verify Batches', href: '/verifier/pending', icon: CheckCircleIcon },
      { name: 'History', href: '/verifier/history', icon: CubeIcon },
      { name: 'Profile', href: '/profile', icon: UserIcon },
    ],
    consumer: [
      { name: 'Home', href: '/consumer', icon: HomeIcon },
      { name: 'Search', href: '/consumer/search', icon: MagnifyingGlassIcon },
      { name: 'Scan QR', href: '/consumer/scan', icon: CubeIcon },
      { name: 'Profile', href: '/profile', icon: UserIcon },
    ],
  };

  const currentNav = navigation[user?.role] || navigation.consumer;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl">🌾</span>
              <span className="ml-2 text-xl font-bold text-primary-700">
                FarmChain
              </span>
            </Link>

            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.name}
                  <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                    {user.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {user && (
          <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-64px)]">
            <nav className="p-4 space-y-2">
              {currentNav.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
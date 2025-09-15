import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Target, 
  LogOut,
  User,
  Settings,
  Bell,
  Menu,
  X,
  Home,
  BarChart3,
  Users,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-glow shadow-elegant border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Section */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Vocalyx</h1>
                  <p className="text-white/80 text-sm">AI Sales Executive</p>
                </div>
              </div>
              
              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/20 hover:text-white" onClick={() => navigate('/analytics')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/80 hover:bg-white/20 hover:text-white"
                  onClick={() => window.location.href = '/sentiment-analysis'}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Sentiment
                </Button>
                <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/20 hover:text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </Button>
                <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/20 hover:text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </nav>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </Button>
              
              {/* Settings */}
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Settings className="h-5 w-5" />
              </Button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-white/70">{user?.email}</p>
                </div>
                <div className="bg-white/20 p-2 rounded-full">
                  <User className="h-5 w-5 text-white" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-white/80 hover:bg-white/20 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Mobile Menu Button */}
              <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/20">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="text-center">
          <div className="mb-8">
            <div className="gradient-primary p-6 rounded-2xl shadow-elegant inline-block mb-6">
              <Target className="h-16 w-16 text-primary-foreground" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Welcome back, {user?.firstName}!
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Welcome to Vocalyx - your AI-powered sales executive platform. 
              Ready to boost your sales performance with intelligent insights and automation.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
import { useAuth } from '@/contexts/AuthContext';
import { Target } from 'lucide-react';
import NavigationBar from '@/components/NavigationBar';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

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
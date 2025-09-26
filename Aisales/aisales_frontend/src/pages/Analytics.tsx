import React from 'react';
import AnalyticsGoals from '@/components/AnalyticsGoals';
import NavigationBar from '@/components/NavigationBar';

const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="px-6 py-8 max-w-7xl mx-auto">
        <AnalyticsGoals />
      </main>
    </div>
  );
};

export default Analytics;



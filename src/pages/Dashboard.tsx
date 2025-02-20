import React, { useEffect, useState } from 'react';
import { Cloud, DollarSign, FileText, Calendar } from 'lucide-react';

const Dashboard = () => {
  const [expenseStats, setExpenseStats] = useState({
    monthlyTotal: 0,
    trend: '0'
  });

  const [notesStats, setNotesStats] = useState({
    total: 0,
    change: 0
  });

  const [completedTasks, setCompletedTasks] = useState(() => {
    const savedRoutines = localStorage.getItem('dailyRoutines');
    if (!savedRoutines) return { total: 0, change: 0 };
    
    const routines = JSON.parse(savedRoutines);
    const completed = routines.filter(routine => routine.completed).length;
    return {
      total: completed,
      change: completed - routines.filter(routine => !routine.completed).length
    };
  });

  useEffect(() => {
    // Calculate expense statistics
    const calculateExpenseStats = () => {
      const savedExpenses = localStorage.getItem('expenses');
      if (!savedExpenses) return;

      const expenses = JSON.parse(savedExpenses);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Calculate this month's total
      const thisMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      });

      // Calculate last month's total
      const lastMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === previousMonth && 
               expenseDate.getFullYear() === previousYear;
      });

      const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Calculate trend percentage
      const trend = lastMonthTotal !== 0 
        ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
        : '0';

      setExpenseStats({
        monthlyTotal: thisMonthTotal,
        trend: trend
      });
    };

    // Calculate notes statistics
    const calculateNotesStats = () => {
      const savedNotes = localStorage.getItem('notes');
      if (!savedNotes) return;

      const notes = JSON.parse(savedNotes);
      const currentDate = new Date();
      const lastWeek = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      const total = notes.length;
      const recentNotes = notes.filter(note => new Date(note.date) >= lastWeek);
      
      setNotesStats({
        total,
        change: recentNotes.length
      });
    };

    calculateExpenseStats();
    calculateNotesStats();

    // Update storage change handler
    const handleStorageChange = () => {
      calculateExpenseStats();
      calculateNotesStats();
      
      const savedRoutines = localStorage.getItem('dailyRoutines');
      if (savedRoutines) {
        const routines = JSON.parse(savedRoutines);
        const completed = routines.filter(routine => routine.completed).length;
        setCompletedTasks({
          total: completed,
          change: completed - routines.filter(routine => !routine.completed).length
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome to Daily Life Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          icon={<Cloud className="w-8 h-8 text-blue-500" />}
          title="Weather"
          description="Check today's forecast"
          link="/weather"
        />
        <DashboardCard
          icon={<DollarSign className="w-8 h-8 text-green-500" />}
          title="Expenses"
          description="Track your spending"
          link="/expenses"
        />
        <DashboardCard
          icon={<Calendar className="w-8 h-8 text-purple-500" />}
          title="Daily Routine"
          description="Manage your schedule"
          link="/routine"
        />
        <DashboardCard
          icon={<FileText className="w-8 h-8 text-yellow-500" />}
          title="Notes"
          description="Organize your thoughts"
          link="/notes"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Notes Created" 
            value={notesStats.total.toString()} 
            change={`+${notesStats.change}`} 
          />
          <StatCard 
            title="Tasks Completed" 
            value={completedTasks.total.toString()} 
            change={completedTasks.change > 0 ? `+${completedTasks.change}` : completedTasks.change.toString()} 
          />
          <StatCard 
            title="Expenses This Month" 
            value={`৳${expenseStats.monthlyTotal.toFixed(2)}`} 
            change={`${parseFloat(expenseStats.trend) > 0 ? '+' : ''}${expenseStats.trend}%`} 
          />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ icon, title, description, link }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) => (
  <a
    href={link}
    className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-4">
      {icon}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  </a>
);

const StatCard = ({ title, value, change }: {
  title: string;
  value: string;
  change: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className={`ml-2 text-sm font-medium ${
        change.startsWith('+') ? 'text-green-600' : 'text-red-600'
      }`}>
        {change}
      </p>
    </div>
  </div>
);

export default Dashboard;
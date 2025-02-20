import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, DollarSign, X } from 'lucide-react';
import { format } from 'date-fns';

const Expenses = () => {
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    amount: ''
  });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];

  // Calculate statistics for the current month
  const calculateMonthlyStats = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const monthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() + 1 === month && 
             expenseDate.getFullYear() === year;
    });

    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const daysInMonth = new Date(year, month, 0).getDate();
    const averageDaily = monthExpenses.length ? total / daysInMonth : 0;
    const largest = expenses.reduce((max, expense) => 
      expense.amount > max.amount ? expense : max, 
      { amount: 0, category: 'None' }
    );

    return {
      total: total.toFixed(2),
      averageDaily: averageDaily.toFixed(2),
      largest
    };
  };

  // Generate data for the bar chart
  const generateChartData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Create array with all days of the month
    const dailyData = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        date: dateStr,
        amount: 0,
        displayDate: format(new Date(dateStr), 'MMM d')
      };
    });

    // Fill in the actual expenses
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getMonth() + 1 === month && expenseDate.getFullYear() === year) {
        const dayIndex = expenseDate.getDate() - 1;
        dailyData[dayIndex].amount += expense.amount;
      }
    });

    return dailyData;
  };

  const stats = calculateMonthlyStats();
  const chartData = generateChartData();

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount) return;

    const expense = {
      id: Date.now(),
      date: newExpense.date,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount)
    };

    setExpenses([expense, ...expenses]);
    setIsModalOpen(false);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      category: 'Food',
      amount: ''
    });
  };

  // Function to delete an expense
  const handleDeleteExpense = (id: number) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
  };

  // Function to delete all expenses with confirmation
  const handleDeleteAllExpenses = () => {
    if (window.confirm('Are you sure you want to delete all expenses? This action cannot be undone.')) {
      setExpenses([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add Expense</span>
          </button>
          <button 
            onClick={handleDeleteAllExpenses}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          title="Total This Month" 
          amount={`৳${stats.total}`}
        />
        <SummaryCard 
          title="Average Daily" 
          amount={`৳${stats.averageDaily}`}
        />
        <SummaryCard 
          title="Largest Expense" 
          amount={`৳${stats.largest.amount.toFixed(2)}`}
          category={stats.largest.category}
        />
      </div>

      {/* Spending Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Daily Spending Trend</h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from(new Set(expenses.map(expense => {
              const date = new Date(expense.date);
              return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }))).sort().reverse().map((monthYear) => (
              <option key={monthYear} value={monthYear}>
                {format(new Date(monthYear + '-01'), 'MMMM yyyy')}
              </option>
            ))}
          </select>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="displayDate"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={2}
              />
              <YAxis
                tickFormatter={(value) => `৳${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`৳${value.toFixed(2)}`, 'Spent']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar 
                dataKey="amount" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
        </div>
        <div className="p-4 space-y-6">
          {Object.entries(
            expenses.reduce((groups, expense) => {
              const date = expense.date;
              if (!groups[date]) {
                groups[date] = [];
              }
              groups[date].push(expense);
              return groups;
            }, {} as Record<string, typeof expenses>)
          )
            .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
            .map(([date, dayExpenses]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      {dayExpenses.length} expense{dayExpenses.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Total: ৳{dayExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-3">
                  {dayExpenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                        <span className="text-sm text-gray-900">৳{expense.amount.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-sm text-red-600 hover:text-red-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No expenses recorded yet
              </div>
            )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Expense</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, amount, category }: {
  title: string;
  amount: string;
  category?: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <DollarSign className="w-5 h-5 text-gray-400" />
    </div>
    <p className="mt-2 text-3xl font-semibold text-gray-900">{amount}</p>
    {category && (
      <p className="mt-2 text-sm text-gray-600">Category: {category}</p>
    )}
  </div>
);

export default Expenses;
import React, { useState, useEffect } from 'react';
import { Plus, Clock, Check, X, Calendar, Pencil } from 'lucide-react';

const Routine = () => {
  // Daily Routine State with localStorage persistence
  const [routines, setRoutines] = useState(() => {
    const savedRoutines = localStorage.getItem('dailyRoutines');
    return savedRoutines ? JSON.parse(savedRoutines) : [
      {
        id: 1,
        time: '07:00',
        task: 'Morning Exercise',
        completed: false
      },
      {
        id: 2,
        time: '09:00',
        task: 'Team Meeting',
        completed: true
      },
      {
        id: 3,
        time: '12:00',
        task: 'Lunch Break',
        completed: false
      }
    ];
  });

  // Class Schedule State with localStorage persistence
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem('courses');
    return savedCourses ? JSON.parse(savedCourses) : [];
  });

  // Add new states for task modal and editing
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    time: '07:00',
    task: '',
    completed: false
  });

  // Save routines to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dailyRoutines', JSON.stringify(routines));
  }, [routines]);

  // Save courses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  // Update the newCourse state to use 24-hour format times
  const [newCourse, setNewCourse] = useState({
    name: '',
    day: 'Sunday',
    startTime: '08:00',
    endTime: '09:30',
    room: '',
    section: 'A'
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const timeSlots = [
    '8:00 AM',
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM',
    '6:00 PM'
  ];

  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return ((hours - 8) * 60 + minutes) * (600 / 600);
  };

  // Daily Routine Functions
  const toggleComplete = (id: number) => {
    setRoutines(routines.map(routine =>
      routine.id === id ? { ...routine, completed: !routine.completed } : routine
    ));
  };

  // Class Schedule Functions
  const addCourse = () => {
    if (!newCourse.name || !newCourse.room) {
      alert('Please fill in all required fields');
      return;
    }
    
    setCourses([...courses, { ...newCourse, id: Date.now() }]);
    setNewCourse({
      name: '',
      day: 'Sunday',
      startTime: '08:00',
      endTime: '09:30',
      room: '',
      section: 'A'
    });
  };

  const deleteCourse = (courseId: number) => {
    setCourses(courses.filter(course => course.id !== courseId));
  };

  const colorMap = new Map();
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
    'bg-red-500', 'bg-yellow-500', 'bg-pink-500'
  ];
  
  const getCourseColor = (courseName: string) => {
    if (!colorMap.has(courseName)) {
      colorMap.set(courseName, colors[colorMap.size % colors.length]);
    }
    return colorMap.get(courseName);
  };

  // Daily Routine Functions
  const handleAddTask = () => {
    if (!newTask.task) {
      alert('Please enter a task');
      return;
    }

    if (editingTask) {
      setRoutines(routines.map(routine =>
        routine.id === editingTask.id ? { ...newTask, id: editingTask.id } : routine
      ));
    } else {
      setRoutines([...routines, { ...newTask, id: Date.now() }]);
    }

    setNewTask({
      time: '07:00',
      task: '',
      completed: false
    });
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setNewTask({
      time: task.time,
      task: task.task,
      completed: task.completed
    });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: number) => {
    setRoutines(routines.filter(routine => routine.id !== taskId));
  };

  // Add this helper function at the top of your component
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Calculate completed tasks stats
  const totalTasks = routines.length;
  const completedTasks = routines.filter(routine => routine.completed).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Daily Routine Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Daily Routine</h1>
          <button 
            onClick={() => {
              setEditingTask(null);
              setNewTask({
                time: '07:00',
                task: '',
                completed: false
              });
              setIsTaskModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Today's Progress */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {completedTasks} of {totalTasks} tasks completed
          </div>
        </div>

        {/* Updated Routine List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {routines.map((routine) => (
              <div key={routine.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">{routine.time}</p>
                    <p className="text-gray-900 font-medium">{routine.task}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditTask(routine)}
                    className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(routine.id)}
                    className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={() => toggleComplete(routine.id)}
                    className={`p-2 rounded-full ${
                      routine.completed
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {routine.completed ? <Check size={20} /> : <X size={20} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button 
                onClick={() => setIsTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Time</label>
                <input
                  type="time"
                  value={newTask.time}
                  onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Task</label>
                <input
                  type="text"
                  value={newTask.task}
                  onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task description"
                />
              </div>
              <button
                onClick={handleAddTask}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                {editingTask ? 'Save Changes' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Schedule Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Class Schedule</h2>
        </div>

        {/* Add Course Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Add New Course</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Course Name</label>
              <input
                type="text"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Computer Science 101"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Room</label>
              <input
                type="text"
                value={newCourse.room}
                onChange={(e) => setNewCourse({ ...newCourse, room: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 301"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Section</label>
              <input
                type="text"
                value={newCourse.section}
                onChange={(e) => setNewCourse({ ...newCourse, section: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. A"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Day</label>
              <select
                value={newCourse.day}
                onChange={(e) => setNewCourse({ ...newCourse, day: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={newCourse.startTime}
                onChange={(e) => setNewCourse({ ...newCourse, startTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={newCourse.endTime}
                onChange={(e) => setNewCourse({ ...newCourse, endTime: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={addCourse}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus size={20} /> Add Course
          </button>
        </div>

        {/* Class Schedule Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-7 gap-4 mb-4">
                {days.map(day => (
                  <div key={day} className="text-center font-bold text-gray-900">{day}</div>
                ))}
              </div>
              <div className="relative" style={{ height: '600px' }}>
                {/* Time markers */}
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="absolute w-full border-t border-gray-200 text-xs text-gray-500"
                    style={{ top: `${(index * 60)}px` }}
                  >
                    {time}
                  </div>
                ))}
                
                {/* Courses */}
                {courses.map((course) => {
                  const startY = getTimePosition(course.startTime);
                  const endY = getTimePosition(course.endTime);
                  const dayIndex = days.indexOf(course.day);
                  const color = getCourseColor(course.name);
                  
                  return (
                    <div
                      key={course.id}
                      className={`absolute rounded-lg p-2 ${color}`}
                      style={{
                        top: `${startY}px`,
                        height: `${endY - startY}px`,
                        left: `${(dayIndex * (100/7))}%`,
                        width: `${100/7}%`,
                      }}
                    >
                      <div className="text-white text-sm">
                        <div className="font-bold">{course.name}</div>
                        <div>Room: {course.room}</div>
                        <div>Section: {course.section}</div>
                        <div>{formatTime(course.startTime)} - {formatTime(course.endTime)}</div>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="absolute top-2 right-2 text-white/80 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ title, tasks, time }: {
  title: string;
  tasks: string[];
  time: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="font-semibold text-gray-900">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{time}</p>
    <ul className="mt-4 space-y-2">
      {tasks.map((task, index) => (
        <li key={index} className="flex items-center space-x-2">
          <Check size={16} className="text-green-500" />
          <span className="text-gray-600">{task}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Routine;
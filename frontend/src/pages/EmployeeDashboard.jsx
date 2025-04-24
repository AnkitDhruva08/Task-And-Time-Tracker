// EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBill, FaUser, FaFileAlt, FaPhoneAlt, FaHome, FaCalendarAlt } from 'react-icons/fa';
import TaskLogForm from './TaskLogForm';
import TaskTable from './TaskTable';
import Header from '../components/header/Header';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const validateTaskHours = (taskData) => {
    const totalHoursToday = tasks
      .filter((task) => task.date === taskData.date)
      .reduce((acc, task) => acc + task.hours_spent, 0);

    if (totalHoursToday + taskData.hours_spent > 8) {
      alert('Total hours for the day cannot exceed 8 hours.');
      return false;
    }
    return true;
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:8000/api/tasks/list/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      console.log('tasks ===>>', data);

      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error('Unexpected data format:', data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = (taskData) => {
    if (!validateTaskHours(taskData)) return; 

    setLoading(true);

    // Simulating an API response:
    setTimeout(() => {
      const newTask = { ...taskData, id: Date.now(), status: 'Pending' };
      setTasks([...tasks, newTask]);
      setLoading(false);
      setShowModal(false);
    }, 1000);
  };

  const sidebarLinks = [
    { name: "Add Task", path: "/add-task", icon: <FaMoneyBill /> },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col py-6 px-4 shadow-lg">
        <div className="text-2xl font-bold mb-8 text-center">Dashboard</div>
        <nav className="flex-1 space-y-4">
          {sidebarLinks.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center px-2 py-2 rounded hover:bg-gray-700 transition text-lg"
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ✅ Header Component */}
      <div className="flex-1 flex flex-col">
        <Header />

        {/* Main Content */}
        <div className="container mx-auto p-6">
          <div className="mb-4">
            {/* Add Task Button */}
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Add Task
            </button>
          </div>

          {/* Task Table */}
          <TaskTable tasks={tasks} setTasks={setTasks} /> {/* Display the Task Table */}

          {/* Modal for adding task */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add New Task</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 text-lg"
                  >
                    &times; {/* Close Icon */}
                  </button>
                </div>

                {/* Task Log Form */}
                <TaskLogForm addTask={addTask} loading={loading} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

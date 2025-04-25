// EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBill } from 'react-icons/fa';
import TaskLogForm from './TaskLogForm';
import TaskTable from './TaskTable';
import Header from '../components/header/Header';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [comment, setComment] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [editTask, setEditTask] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const openEditModal = (task) => {
    setEditTask(task);
    setUpdatedData({ ...task}); 
  };

  const openViewModal = (task) => {
    setViewTask(task);
    setStatusUpdate(task.status);
    setComment(task.manager_comments || '');
    setError(null);
    setSuccess(null);
  

  }

//  for fetching the records from the server
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


  //  function for add task 
  const addTask = (taskData) => {
    if (!validateTaskHours(taskData)) return;

    setLoading(true);
    setTimeout(() => {
      const newTask = { ...taskData, id: Date.now(), status: 'Pending' };
      setTasks([...tasks, newTask]);
      setLoading(false);
      setShowModal(false);
    }, 1000);
  };

  // for update the task 
  const updateTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/tasks/${editTask.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...updatedData
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
  
      const updated = await response.json();
      updated.tags = typeof updated.tags === "string" ? updated.tags.split(",") : updated.tags;
  
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditTask(null); // Close the modal
      alert("Task updated!");
  
      // Refresh the page
      window.location.reload();
    } catch (err) {
      console.error("Update error:", err);
      alert("Could not update task.");
    }
  };

  //  sidde bar links 
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

      {/* Main Panel */}
      <div className="flex-1 flex flex-col">
        <Header />

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

          <TaskTable tasks={tasks} setTasks={setTasks} onEdit={openEditModal} onView={openViewModal}/>

          {/* Add Task Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add New Task</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 text-lg"
                  >
                    &times;
                  </button>
                </div>
                <TaskLogForm addTask={addTask} loading={loading} />
              </div>
            </div>
          )}

          {/* Edit Task Modal */}
          {editTask && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-lg">
                <h2 className="text-2xl font-bold text-blue-700 mb-4">Edit Task</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateTask();
                  }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Title"
                    value={updatedData.title || ""}
                    onChange={(e) => setUpdatedData({ ...updatedData, title: e.target.value })}
                  />
                  <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Description"
                    value={updatedData.description || ""}
                    onChange={(e) => setUpdatedData({ ...updatedData, description: e.target.value })}
                  />
                  <input
                    type="date"
                    className="w-full p-2 border rounded"
                    value={updatedData.date || ""}
                    onChange={(e) => setUpdatedData({ ...updatedData, date: e.target.value })}
                  />
                  <input
                    type="number"
                    step="0.25"
                    className="w-full p-2 border rounded"
                    placeholder="Hours Spent"
                    value={updatedData.hours_spent || ""}
                    onChange={(e) => setUpdatedData({ ...updatedData, hours_spent: parseFloat(e.target.value) })}
                  />
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="Tags (comma separated)"
                    value={updatedData.tags || ""}
                    onChange={(e) => setUpdatedData({ ...updatedData, tags: e.target.value })}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditTask(null)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
  {/*  view task  */}

{viewTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Task Review</h2>

            <div className="space-y-3 text-sm">
              <p><strong>Employee:</strong> {viewTask.employee}</p>
              <p><strong>Title:</strong> {viewTask.title}</p>
              <p><strong>Description:</strong> {viewTask.description}</p>
              <p><strong>Hours:</strong> {viewTask.hours_spent}</p>
              <p><strong>Tags:</strong> {(Array.isArray(viewTask.tags) ? viewTask.tags : []).join(", ")}</p>
              <p><strong>Date:</strong> {viewTask.date}</p>

              <div>
                <label className="font-medium">Status</label>
                <select
                  className="w-full p-2 border rounded mt-1"
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="font-medium">Manager Comment</label>
                <textarea
                  rows="3"
                  className="w-full p-2 border rounded mt-1"
                  placeholder="Add your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setViewTask(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;

import { useEffect, useState } from "react";
import Header from "../components/header/Header";
import Swal from "sweetalert2";
import Select from 'react-select';
import { FaMoneyBill } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import StatusDropdown from "../components/StatusDropdown";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const ManagerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({
    employee: "",
    tags: "",
    status: "",
    date: "",
  });

  const [loading, setLoading] = useState(true);
  const [viewTask, setViewTask] = useState(null);
  const [comment, setComment] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Employee registration form state
  const [employeeForm, setEmployeeForm] = useState({
    employee_name: "",
    password: "",
    email: "",
    address: "",
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/tasks/list/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Unauthorized");
      }

      

      const data = await response.json();
      console.log("tasks ===>>", data);

      if (Array.isArray(data)) {
        // Convert string tags to arrays
        const processed = data.map((task) => ({
          ...task,
          tags: typeof task.tags === "string" ? task.tags.split(",") : task.tags,
        }));
        setTasks(processed);
      } else {
        console.error("Unexpected data format:", data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    return (
      (!filter.employee || task.username.toLowerCase().includes(filter.employee.toLowerCase())) &&
      (!filter.tags || task.tags.some(tag => tag.toLowerCase().includes(filter.tags.toLowerCase()))) &&
      (!filter.status || task.status.toLowerCase() === filter.status.toLowerCase()) &&
      (!filter.date || task.date === filter.date)
    );
  });

  const updateTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/tasks/${viewTask.id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: statusUpdate,
          manager_comments: comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();
      updatedTask.tags = typeof updatedTask.tags === "string"
        ? updatedTask.tags.split(",")
        : updatedTask.tags;

      setTasks((prev) =>
        prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );

      setSuccess("Task updated successfully!");
      setTimeout(() => {
        setViewTask(null);
        setSuccess(null);
      }, 1000);
    } catch (err) {
      console.error("Update error:", err);
      setError("Could not update task.");
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:8000/api/tasks/${id}/`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const results = await res.json();
          fetchTasks(); // Refresh tasks after deletion
          Swal.fire('Deleted!', 'The Task has been deleted.', 'success');
        } else {
          Swal.fire('Error!', 'There was an issue deleting the task.', 'error');
        }
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete task.");
        Swal.fire('Error!', 'Failed to delete the task.', 'error');
      }
    }
  };


   // Create chart data based on tasks
   const chartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        label: 'Hours Spent',
        data: [
          filteredTasks.filter((task) => task.status === 'approved').reduce((sum, task) => sum + task.hours_spent, 0),
          filteredTasks.filter((task) => task.status === 'pending').reduce((sum, task) => sum + task.hours_spent, 0),
          filteredTasks.filter((task) => task.status === 'rejected').reduce((sum, task) => sum + task.hours_spent, 0)
        ],
        backgroundColor: ['#4CAF50', '#FFEB3B', '#F44336'],
        borderColor: ['#388E3C', '#FBC02D', '#D32F2F'],
        borderWidth: 1,
      }
    ]
  };

  const handleEmployeeFormChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    const { employee_name, password, email, address } = employeeForm;

    // Check for empty fields
    if (!employee_name || !password || !email || !address) {
      Swal.fire('Error', 'All fields are required', 'error');
      return;
    }

    const formData = { employee_name, password, email, address };

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire('Success', 'Employee registered successfully!', 'success');
        setEmployeeForm({ name: "", password: "", email: "", address: "" }); // Reset form
        setShowModal(false); // Close modal
      } else {
        const errorData = await response.json();
        Swal.fire('Error', errorData.message || 'Failed to register employee', 'error');
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire('Error', 'An error occurred while registering employee', 'error');
    }
  };

  const totalHours = filteredTasks.reduce((sum, t) => sum + (parseFloat(t.hours_spent) || 0), 0);
  const pendingCount = filteredTasks.filter((t) => t.status.toLowerCase() === "pending").length;
  const allTags = filteredTasks.flatMap((t) => t.tags);
  const mostUsedTag = allTags.sort((a, b) =>
    allTags.filter(tag => tag === b).length - allTags.filter(tag => tag === a).length
  )[0];

  useEffect(() => {
    fetchTasks();
  }, []);


    //  sidde bar links 
    const sidebarLinks = [
      {
        name: "Add Employee",
        icon: <FaMoneyBill />,
        onClick: () => setShowModal(true), 
      },
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
        <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          + Add Employee
        </button>
      </div>

       {/* Chart for Hours Spent */}
       <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Task Hours Analysis by Status</h2>
        <div className="bg-white p-4 rounded shadow">
          <Bar data={chartData} options={{
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Hours Spent Per Task Status'
              },
              tooltip: {
                callbacks: {
                  label: function(tooltipItem) {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw} hours`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Task Status'
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Hours'
                },
                beginAtZero: true
              }
            }
          }} />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by employee"
          className="p-2 border rounded"
          value={filter.employee}
          onChange={(e) => setFilter({ ...filter, employee: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filter by tag"
          className="p-2 border rounded"
          value={filter.tags} 
          onChange={(e) => setFilter({ ...filter, tags: e.target.value })}
        />
         <StatusDropdown filter={filter} setFilter={setFilter} />
        <input
          type="date"
          className="p-2 border rounded"
          value={filter.date}
          onChange={(e) => setFilter({ ...filter, date: e.target.value })}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="font-medium">Total Hours</h2>
          <p className="text-xl font-bold">{totalHours || 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="font-medium">Pending Tasks</h2>
          <p className="text-xl font-bold">{pendingCount || 0}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="font-medium">Most Used Tag</h2>
          <p className="text-xl font-bold">{mostUsedTag || "N/A"}</p>
        </div>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Title</th>
                <th className="p-3">Date</th>
                <th className="p-3">Hours</th>
                <th className="p-3">Tags</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, idx) => (
                <tr key={task.id || idx} className="border-t hover:bg-gray-50">
                  <td className="p-3">{task.username}</td>
                  <td className="p-3">{task.title}</td>
                  <td className="p-3">{task.date}</td>
                  <td className="p-3">{task.hours_spent}</td>
                  <td className="p-3 space-x-2">
                    {(Array.isArray(task.tags) ? task.tags : []).map((tag, idx) => (
                      <span key={idx} className="inline-block px-2 py-1 bg-gray-200 rounded text-xs">
                        {tag.trim()}
                      </span>
                    ))}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <span className={`px-2 py-1 text-sm rounded ${statusColors[task.status]}`}>
                      {task.status}
                    </span>
                    <button
                      onClick={() => {
                        setViewTask(task);
                        setStatusUpdate(task.status);
                        setComment(task.manager_comments || "");
                        setError(null);
                        setSuccess(null);
                      }}
                      title="View & Update"
                      className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      title="Delete Task"
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Register New Employee</h2>

            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div>
                <label className="font-medium">Employee Name</label>
                <input
                  type="text"
                  name="employee_name"
                  value={employeeForm.employee_name}
                  onChange={handleEmployeeFormChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={employeeForm.password}
                  onChange={handleEmployeeFormChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={employeeForm.email}
                  onChange={handleEmployeeFormChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>

              <div>
                <label className="font-medium">Address</label>
                <textarea
                  name="address"
                  value={employeeForm.address}
                  onChange={handleEmployeeFormChange}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Task Modal */}
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
              <button
                onClick={updateTask}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
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

export default ManagerDashboard;

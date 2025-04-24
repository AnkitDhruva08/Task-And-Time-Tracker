import { useState } from "react";

// Dummy task and employee data
const mockTasks = [
  {
    id: 1,
    employee: "John Doe",
    title: "API Integration",
    date: "2025-04-22",
    hours: 4,
    tags: ["backend"],
    status: "Pending",
  },
  {
    id: 2,
    employee: "Jane Smith",
    title: "UI Fix",
    date: "2025-04-22",
    hours: 3,
    tags: ["frontend", "design"],
    status: "Approved",
  },
];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const ManagerDashboard = () => {
  const [filter, setFilter] = useState({
    employee: "",
    tag: "",
    status: "",
    date: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employee_name: "",
    email: "",
    password: "",
    address: "",
  });

  const filteredTasks = mockTasks.filter((task) => {
    return (
      (!filter.employee || task.employee.includes(filter.employee)) &&
      (!filter.tag || task.tags.includes(filter.tag)) &&
      (!filter.status || task.status === filter.status) &&
      (!filter.date || task.date === filter.date)
    );
  });

  // Summary data
  const totalHours = filteredTasks.reduce((sum, t) => sum + t.hours, 0);
  const pendingCount = filteredTasks.filter((t) => t.status === "Pending").length;
  const allTags = filteredTasks.flatMap((t) => t.tags);
  const mostUsedTag = allTags.sort((a, b) =>
    allTags.filter(tag => tag === b).length - allTags.filter(tag => tag === a).length
  )[0];

  const handleAddEmployee = async () => {
    setError(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEmployee),
      });

      const data = await response.json();
      console.log("Add employee response ===>", data);

      if (data.status === 200) {
        setSuccessMsg("Employee added successfully!");
        setNewEmployee({ manager_name: "", email: "", password: "", address: "" });
        setTimeout(() => {
          setShowModal(false);
          setSuccessMsg(null);
        }, 1500);
      } else {
        setError("This email or username already exists.");
      }
    } catch (err) {
      console.error("API error:", err);
      setError("Something went wrong. Please try again.");
    }
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Manager Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          + Add Employee
        </button>
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
          value={filter.tag}
          onChange={(e) => setFilter({ ...filter, tag: e.target.value })}
        />
        <select
          className="p-2 border rounded"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
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
          <p className="text-xl font-bold">{totalHours}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="font-medium">Pending Tasks</h2>
          <p className="text-xl font-bold">{pendingCount}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="font-medium">Most Used Tag</h2>
          <p className="text-xl font-bold">{mostUsedTag || "N/A"}</p>
        </div>
      </div>

      {/* Task Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-200 text-left text-sm font-medium text-gray-700">
              <th className="p-3">Employee</th>
              <th className="p-3">Title</th>
              <th className="p-3">Date</th>
              <th className="p-3">Hours</th>
              <th className="p-3">Tags</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{task.employee}</td>
                <td className="p-3">{task.title}</td>
                <td className="p-3">{task.date}</td>
                <td className="p-3">{task.hours}</td>
                <td className="p-3 space-x-2">
                  {task.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-sm rounded ${statusColors[task.status]}`}
                  >
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="6" className="p-3 text-center text-gray-500">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add New Employee</h2>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full mb-3 p-2 border rounded"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-3 p-2 border rounded"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
            />
            <select
              className="w-full mb-4 p-2 border rounded"
              value={newEmployee.role}
              onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;

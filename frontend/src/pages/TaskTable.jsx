import React from 'react';
import Swal from "sweetalert2";

const TaskTable = ({ tasks, setTasks, onEdit, onView }) => {
  const handleEdit = (task) => {
    onEdit(task);
  };  
  const handleView = (task) => {
    onView(task);
  };



  // funcrtion for delete the task 
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
          Swal.fire('Deleted!', 'The Task has been deleted.', 'success');
        } else {
          Swal.fire('Error!', 'There was an issue deleting the task.', 'error');
        }
        window.location.reload();
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete task.");
        Swal.fire('Error!', 'Failed to delete the task.', 'error');
      }
    }
  };


  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-200 text-gray-700">
          <tr>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Hours</th>
            <th className="px-4 py-2">Tags</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{task.title}</td>
              <td className="px-4 py-2">{task.description}</td>
              <td className="px-4 py-2">{task.date}</td>
              <td className="px-4 py-2">{task.hours_spent}</td>
              <td className="px-4 py-2">{task.tags}</td>
              <td className="px-4 py-2">
                <span className={`font-bold ${task.status === 'rejected' ? 'text-red-500' : 'text-green-500'}`}>
                  {task.status}
                </span>
              </td>
              <td className="px-4 py-2 space-x-2">
                {task.status === 'rejected' && (
                  <>
                   <button
                    onClick={() => handleEdit(task)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                  >
                    Edit
                  </button>

                  <button
                      onClick={() => handleView(task)}
                      className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
                    >
                      View
                    </button>
                  </>
                 
                  
                  
                )}
                {task.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleEdit(task)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleView(task)}
                      className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </>
                )}
                {task.status === 'approved' && (
                  <span className="text-gray-500">No actions available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
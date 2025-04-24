import React from 'react';

const TaskTable = ({ tasks, setTasks }) => {

  // Handle delete logic
  const handleDelete = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
  };

  // Handle edit logic (this would ideally open a form or modal)
  const handleEdit = (taskId) => {
    console.log('Edit task with ID:', taskId);
    // Implement your task editing logic here
  };

  if (!Array.isArray(tasks)) {
    return <p>No tasks available</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Hours Spent</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Tags</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Manager Comments</th>
            <th className="px-4 py-2 text-left">Actions</th> {/* Added column for actions */}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b hover:bg-gray-100">
              <td className="px-4 py-2">{task.title}</td>
              <td className="px-4 py-2">{task.description}</td>
              <td className="px-4 py-2">{task.hours_spent}</td>
              <td className="px-4 py-2">{task.date}</td>
              <td className="px-4 py-2">{task.tags}</td>
              <td className={`px-4 py-2 ${task.status === 'pending' ? 'text-yellow-500' : task.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                {task.status}
              </td>
              <td className="px-4 py-2">{task.manager_comments || 'No comments'}</td>

              {/* Actions Column - Edit/Delete Buttons */}
              <td className="px-4 py-2 flex space-x-2">
                {task.status === 'rejected' && (
                  <>
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(task.id)}
                      className="bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
                {task.status !== 'rejected' && (
                  <button
                    disabled
                    className="bg-gray-400 text-white py-1 px-4 rounded"
                  >
                    No Action
                  </button>
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

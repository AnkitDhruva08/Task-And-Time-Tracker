import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskLogForm = ({ addTask, loading }) => {
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    hours_spent: 0,
    date: '',
    tags: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({
      ...taskData,
      [name]: value,
    });
  };

  const validateTaskHours = (taskData) => {
    if (taskData.hours_spent > 8) {
      alert("Total hours spent cannot exceed 8 hours per day.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate task hours before proceeding
    if (!validateTaskHours(taskData)) return;
    console.log('taskData ===>>', taskData);

    try {
      // Send task data to backend
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/tasks/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const data = await response.json();
        addTask(data);
        alert("Task added successfully!");
        navigate('/employee-dashboard')
      } else {
        alert("Failed to add task.");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Error adding task.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
          Task Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={taskData.title}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          placeholder="Enter task title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={taskData.description}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          placeholder="Enter task description"
          required
        />
      </div>

      {/* Hours Spent */}
      <div>
        <label htmlFor="hours_spent" className="block text-sm font-semibold text-gray-700">
          Hours Spent
        </label>
        <input
          type="number"
          id="hours_spent"
          name="hours_spent"
          value={taskData.hours_spent}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          min="0"
          max="8"
          placeholder="Enter hours spent (Max 8)"
          required
        />
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={taskData.date}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          required
        />
      </div>

      {/* tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
          Task tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={taskData.tags}
          onChange={handleChange}
          className="mt-1 p-2 w-full border border-gray-300 rounded-md"
          placeholder="Enter task tags (optional)"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskLogForm;

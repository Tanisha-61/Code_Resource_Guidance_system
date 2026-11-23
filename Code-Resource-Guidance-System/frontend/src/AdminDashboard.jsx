import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

const API = "http://localhost:5000/api";

function AdminDashboard() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    language: "",
    topic: "",
    level: "Beginner",
    type: "Course",
    url: "",
  });

  // Fetch resources
  const fetchResources = async () => {
    try {
      const response = await fetch(`${API}/resources`);
      const data = await response.json();

      if (response.ok) {
        setResources(data.resources || data);
      }
    } catch (error) {
      setMessage("Unable to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Input handle
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add resource
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/resources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Resource could not be added.");
        return;
      }

      setMessage("Resource added successfully!");

      setForm({
        title: "",
        description: "",
        language: "",
        topic: "",
        level: "Beginner",
        type: "Course",
        url: "",
      });

      fetchResources();
    } catch (error) {
      setMessage("Server connection error.");
    }
  };

  // Delete resource
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API}/resources/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMessage("Resource deleted successfully!");
        fetchResources();
      } else {
        setMessage("Unable to delete resource.");
      }
    } catch (error) {
      setMessage("Server connection error.");
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <p>Manage programming learning resources.</p>

      <div className="admin-stats">
        <div className="stat-card">
          <h2>{resources.length}</h2>
          <p>Total Resources</p>
        </div>
      </div>

      <h2>Add New Resource</h2>

      <form onSubmit={handleSubmit} className="resource-form">
        <input
          name="title"
          placeholder="Resource Title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <input
          name="language"
          placeholder="Programming Language"
          value={form.language}
          onChange={handleChange}
          required
        />

        <input
          name="topic"
          placeholder="Topic"
          value={form.topic}
          onChange={handleChange}
          required
        />

        <select
          name="level"
          value={form.level}
          onChange={handleChange}
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <select
          name="type"
          value={form.type}
          onChange={handleChange}
        >
          <option>Course</option>
          <option>Video</option>
          <option>Article</option>
          <option>Documentation</option>
          <option>Practice</option>
        </select>

        <input
          name="url"
          type="url"
          placeholder="Resource URL"
          value={form.url}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Resource Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Add Resource
        </button>
      </form>

      {message && <p>{message}</p>}

      <h2>Manage Resources</h2>

      {loading ? (
        <p>Loading resources...</p>
      ) : resources.length === 0 ? (
        <p>No resources added yet.</p>
      ) : (
        resources.map((resource) => (
          <div className="resource-row" key={resource._id}>
            <div>
              <h3>{resource.title}</h3>
              <p>
                {resource.language} | {resource.level}
              </p>
            </div>

            <button
              onClick={() => handleDelete(resource._id)}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminDashboard;
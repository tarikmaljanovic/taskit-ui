// src/pages/DashboardPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DashboardPage.css';

import {
  useMyProjects,
  useOwnedProjects,
  useCreateProject,
} from '../api/queries/useProjects';
import {
  useUserNotifications
} from '../api/queries/useNotifications';
import { Project } from '../types/Project'; // Import your existing Project interface

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // 1) Retrieve userId from localStorage
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      // Adjust if your user object has a different property name
      if (parsed?.id) setUserId(parsed.id);
    }
  }, []);

  // 2) Use React Query hooks (no isLoading usage)
  // If userId is null, these queries simply return empty arrays
  const { data: myProjects } = useMyProjects(userId || undefined);
  const { data: ownedProjects } = useOwnedProjects(userId || undefined);
  const { data: notifications } = useUserNotifications(userId || undefined);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (myProjects && ownedProjects) {
      setProjects([...myProjects, ...ownedProjects]);
    }
  }, [myProjects, ownedProjects]);

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (filter === 'my') {
      setProjects(myProjects || []);
    } else if(filter === 'owned') {
      setProjects(ownedProjects || []);
    } else {
      setProjects([...(myProjects || []), ...(ownedProjects || [])]);
    }
  }, [filter])

  // 3) State to control "Create Project" modal/form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // 4) Create project mutation
  const createProjectMutation = useCreateProject();

  // Handle navigating to project details
  const handleProjectClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  // Modal open/close
  const openCreateModal = () => setShowCreateForm(true);
  const closeCreateModal = () => {
    setShowCreateForm(false);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  // 5) Creating a project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    createProjectMutation.mutate(
      {
        name: newProjectName,
        description: newProjectDesc,
        created_by: userId,
      },
      {
        onSuccess: () => {
          closeCreateModal();
        },
        onError: (error) => {
          alert(`Error creating project: ${error}`);
        },
      }
    );
  };

  // 6) Prepare arrays (no spinner, just show empty or data)
  const myProjectsList = myProjects ?? [];
  const ownedProjectsList = ownedProjects ?? [];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="create-button" onClick={openCreateModal}>
          + New Project
        </button>
        <select onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Projects</option>
          <option value="my">My Projects</option>
          <option value="owned">Owned Projects</option>
        </select>
      </div>

      <div className="projects-section">
        <div className="project-list">
          <h2>My Projects</h2>
          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <ul>
              {projects.map((proj: Project) => (
                <li key={proj.id} onClick={() => handleProjectClick(proj.id)}>
                  <h3>{proj.name}</h3>
                  <p>{proj.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="project-section" style={{marginTop: '32px'}}>
        <div className="project-list">
          <h2>Notification</h2>
          <ul>
            {
              notifications?.map((notification) => (
                <li key={notification.id}>
                  <h3>{notification.message}</h3>
                  <p>{notification.timestamp.split("T")[0]}</p>
                  <p>{notification.timestamp.split("T")[1].slice(0,8)}</p>
                </li>
              ))
            }
          </ul>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create a New Project</h2>
            <form onSubmit={handleCreateProject} className="create-form">
              <label>Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                required
              />

              <label>Project Description</label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                rows={3}
              />

              <div className="form-buttons">
                <button type="submit" className="submit-button">
                  Create
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

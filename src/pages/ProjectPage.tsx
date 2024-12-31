// src/pages/ProjectPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ProjectPage.css';

import {
  useProjectById,
  useProjectOwner,
  useDeleteProject,
  useUpdateProject,
  useAddMemberToProject,
  useProjectMembers,
} from '../api/queries/useProjects';
import { useAllUsers } from '../api/queries/useUser';

import TaskList from '../components/TaskList';
import { useProjectTasks } from '../api/queries/useTasks';
import { User } from '../types/User';

function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project_id = projectId ? parseInt(projectId, 10) : 0;

  // 1) Local user from localStorage to check ownership
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.id) setUserId(parsed.id);
    }
  }, []);

  // 2) Query: get project, project owner, tasks, project members
  const { data: project } = useProjectById(project_id);
  const { data: owner } = useProjectOwner(project_id);
  const { data: tasks } = useProjectTasks(project_id);
  const { data: members } = useProjectMembers(project_id);

  // 3) Check if user is the owner
  const isOwner = owner && userId && owner.id === userId;

  // 4) Edit / Delete / Add Member states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // 5) Mutations
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const addMemberMutation = useAddMemberToProject();

  // 6) Add Member states
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  // Get all users for the dropdown
  const { data: allUsers } = useAllUsers();

  // 7) Handler: open edit project modal
  const handleOpenEdit = () => {
    if (project) {
      setEditName(project.name);
      setEditDesc(project.description || '');
      setShowEditModal(true);
    }
  };

  // 8) Submit update
  const handleUpdateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    updateProjectMutation.mutate(
      {
        id: project.id,
        name: editName,
        description: editDesc,
        created_by: project.created_by.id,
      },
      {
        onSuccess: (updated) => {
          setShowEditModal(false);
        },
        onError: (err) => {
          alert(`Error updating project: ${err}`);
        },
      }
    );
  };

  // 9) Delete project
  const handleDeleteProject = () => {
    if (!project) return;
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(project.id, {
        onSuccess: () => {
          navigate('/dashboard');
        },
        onError: (err) => {
          alert(`Error deleting project: ${err}`);
        },
      });
    }
  };

  // 10) Open Add Member
  const handleOpenAddMember = () => {
    setSelectedMemberId(null);
    setShowAddMemberModal(true);
  };

  // 11) Submit Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project_id || !selectedMemberId) return;

    addMemberMutation.mutate(
      {
        projectId: project_id,
        userId: selectedMemberId,
      },
      {
        onSuccess: (data) => {
          // data is the updated list of members
          setShowAddMemberModal(false);
        },
        onError: (err) => {
          alert(`Error adding member: ${err}`);
        },
      }
    );
  };

  if (!project) {
    return <div className="project-page">Loading project...</div>;
  }

  return (
    <div className="project-page">
      <div className="project-header">
        <h1>{project.name}</h1>
        <p>{project.description}</p>
        {isOwner && (
          <div className="owner-controls">
            <button onClick={handleOpenAddMember}>Add Member</button>
            <button onClick={handleOpenEdit}>Edit Project</button>
            <button onClick={handleDeleteProject}>Delete Project</button>
          </div>
        )}
      </div>

      <div className="project-details">
        <h3>Members:</h3>
        {members && members.length > 0 ? (
          <ul>
            {members.map((m: User) => (
              <li key={m.id}>{m.name || m.email}</li>
            ))}
          </ul>
        ) : (
          <p>No members yet.</p>
        )}
      </div>

      {/* TaskList is a separate component */}
      <TaskList projectId={project_id} tasks={tasks || []} />

      {/* EDIT PROJECT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Project</h2>
            <form className='create-form' onSubmit={handleUpdateProject}>
              <label htmlFor='projectName'>Project Name</label>
              <input
                id='projectName'
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <label htmlFor='projectDesc'>Project Description</label>
              <textarea
                id='projectDesc'
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />

              <div className="form-buttons">
                <button type="submit" className="submit-button">
                  Update
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Member</h2>
            <form className='create-form' onSubmit={handleAddMember}>
              <label>Select a user to add:</label>
              <select
                value={selectedMemberId ?? ''}
                onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                required
              >
                <option value="">-- Select user --</option>
                {allUsers &&
                  allUsers.map((u: User) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email}
                    </option>
                  ))}
              </select>

              <div className="form-buttons">
                <button type="submit" className="submit-button">
                  Add
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowAddMemberModal(false)}
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
}

export default ProjectPage;

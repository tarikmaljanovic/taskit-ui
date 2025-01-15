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

  // 1) Local user from localStorage
  const [userId, setUserId] = useState<number | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.id) setUserId(parsed.id);
    }
  }, []);

  // 2) Queries for project, owner, tasks, members
  const { data: project } = useProjectById(project_id);
  const { data: owner } = useProjectOwner(project_id);
  const { data: tasks } = useProjectTasks(project_id);
  const { data: members } = useProjectMembers(project_id);

  // 3) Check ownership
  const isOwner = owner && userId && owner.id === userId;

  // 4) Edit / Delete / Add Member states (unchanged)
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // 5) Mutations (unchanged)
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();
  const addMemberMutation = useAddMemberToProject();

  // 6) Add Member states (unchanged)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const { data: allUsers } = useAllUsers();

  // 7) Edit project modal handlers (unchanged)
  const handleOpenEdit = () => {
    if (project) {
      setEditName(project.name);
      setEditDesc(project.description || '');
      setShowEditModal(true);
    }
  };

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
        onSuccess: () => setShowEditModal(false),
        onError: (err) => alert(`Error updating project: ${err}`),
      }
    );
  };

  // 8) Delete project (unchanged)
  const handleDeleteProject = () => {
    if (!project) return;
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProjectMutation.mutate(project.id, {
        onSuccess: () => navigate('/dashboard'),
        onError: (err) => alert(`Error deleting project: ${err}`),
      });
    }
  };

  // 9) Add member modal (unchanged)
  const handleOpenAddMember = () => {
    setSelectedMemberId(null);
    setShowAddMemberModal(true);
  };
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project_id || !selectedMemberId) return;
    addMemberMutation.mutate(
      {
        projectId: project_id,
        userId: selectedMemberId,
      },
      {
        onSuccess: () => setShowAddMemberModal(false),
        onError: (err) => alert(`Error adding member: ${err}`),
      }
    );
  };

  // ----------------------------------------------------------
  //          REPORT LOGIC
  // ----------------------------------------------------------
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState<
    { userId: number; userName: string; assignedCount: number; inProgressCount: number; overdueCount: number }[]
  >([]);

  // Called when "Report" button is clicked
  const handleOpenReport = () => {
    if (!tasks || !members) {
      return;
    }
    // Build a map: userId -> { assigned, inProgress, overdue }
    const userStats: Record<number, { assigned: number; inProgress: number; overdue: number }> = {};

    tasks.forEach((task) => {
      // If the task has an assigned user
      const assignedUserId = task.assigned_to?.id;
      if (!assignedUserId) return;

      // Initialize if not present
      if (!userStats[assignedUserId]) {
        userStats[assignedUserId] = { assigned: 0, inProgress: 0, overdue: 0 };
      }

      // assigned count
      userStats[assignedUserId].assigned += 1;

      // inProgress if task.status === "In Progress" (case-insensitive or your logic)
      if (task.status?.toLowerCase() === 'in progress') {
        userStats[assignedUserId].inProgress += 1;
      }

      // overdue if due_date < current date
      if (task.due_date) {
        const due = new Date(task.due_date);
        const now = new Date();
        if (due < now && (task.status?.toLowerCase() !== 'completed')) {
          userStats[assignedUserId].overdue += 1;
        }
      }
    });

    // Convert userStats to an array for rendering
    const dataArray = members.map((m) => {
      const stats = userStats[m.id] || { assigned: 0, inProgress: 0, overdue: 0 };
      return {
        userId: m.id,
        userName: m.name || m.email,
        assignedCount: stats.assigned,
        inProgressCount: stats.inProgress,
        overdueCount: stats.overdue,
      };
    });

    setReportData(dataArray);
    setShowReportModal(true);
  };

  // Close report
  const handleCloseReport = () => {
    setShowReportModal(false);
  };

  // ----------------------------------------------------------
  // END REPORT LOGIC
  // ----------------------------------------------------------

  if (!project) {
    return <div className="project-page">Loading project...</div>;
  }

  return (
    <div className="project-page">
      <div className="project-header">
        <h1>{project.name}</h1>
        <p>{project.description}</p>
        <div className="owner-controls">
          {isOwner && (
            <>
              <button onClick={handleOpenAddMember}>Add Member</button>
              <button onClick={handleOpenEdit}>Edit Project</button>
              <button onClick={handleDeleteProject}>Delete Project</button>
            </>
          )}
          {/* REPORT BUTTON */}
          <button onClick={handleOpenReport}>Report</button>
        </div>
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
      <TaskList projectId={project_id} />

      {/* EDIT PROJECT MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Project</h2>
            <form className="create-form" onSubmit={handleUpdateProject}>
              <label htmlFor="projectName">Project Name</label>
              <input
                id="projectName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <label htmlFor="projectDesc">Project Description</label>
              <textarea
                id="projectDesc"
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
            <form className="create-form" onSubmit={handleAddMember}>
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

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Report</h2>
            <table className="report-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Assigned</th>
                  <th>In Progress</th>
                  <th>Overdue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((row) => (
                  <tr key={row.userId}>
                    <td>{row.userName}</td>
                    <td>{row.assignedCount}</td>
                    <td>{row.inProgressCount}</td>
                    <td>{row.overdueCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="form-buttons">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCloseReport}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectPage;

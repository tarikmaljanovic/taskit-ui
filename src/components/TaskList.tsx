import React, { useState, useEffect } from 'react';
import '../styles/TaskList.css';
import { Task } from '../types/Task';
import { useGeneratePriority, useDeleteTask, useUpdateTask, useProjectTasks } from '../api/queries/useTasks';
import { useProjectMembers } from '../api/queries/useProjects';
import CreateTaskModal from './CreateTaskModal';

interface TaskListProps {
  projectId: number;
}

function TaskList({ projectId }: TaskListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Fetch tasks using useProjectTasks hook
  const { data: taskList, refetch } = useProjectTasks(projectId); // Automatically fetches tasks for the project

  // State for editing a selected task
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // For editing fields
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editAssignedTo, setEditAssignedTo] = useState(0);

  // Hooks
  const deleteTaskMutation = useDeleteTask();
  const updateTaskMutation = useUpdateTask();
  const generatePriorityMutation = useGeneratePriority();

  const { data: members } = useProjectMembers(projectId);

  // Handle opening the Edit Task modal
  const handleOpenTaskModal = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditDueDate(task.due_date || '');
    setEditPriority(task.priority || '');
    setEditStatus(task.status || '');
    setShowEditModal(true);
  };

  // Submitting an updated task
  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    updateTaskMutation.mutate(
      {
        id: selectedTask.id,
        title: editTitle,
        description: editDesc,
        due_date: editDueDate.split('T')[0],
        priority: editPriority,
        status: editStatus,
        assigned_to: editAssignedTo,
        project: selectedTask.project.id,
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
        },
        onError: (err) => {
          alert(`Error updating task: ${err}`);
        },
      }
    );
  };

  // Deleting a task
  const handleDeleteTask = () => {
    if (!selectedTask) return;
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(selectedTask.id, {
        onSuccess: () => {
          setShowEditModal(false);
        },
        onError: (err) => {
          alert(`Error deleting task: ${err}`);
        },
      });
    }
  };

  // Generating Priority for the currently edited task
  const handleGeneratePriority = async () => {
    try {
      const newPriority = await generatePriorityMutation.mutateAsync(editDesc);
      setEditPriority(newPriority);
    } catch (err) {
      alert(`Error generating priority: ${err}`);
    }
  };

  if (!taskList) {
    return <div>Loading...</div>;
  }

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>Tasks</h2>
        <button onClick={() => setShowCreateModal(true)}>Create Task</button>
      </div>

      {taskList.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul className="task-list">
          {taskList.map((t) => (
            <li key={t.id} onClick={() => handleOpenTaskModal(t)}>
              <strong>{t.title}</strong>
              <p>Due: {t.due_date.split("T")[0] || 'N/A'}</p>
              <p>Priority: {t.priority || 'N/A'}</p>
              <p>Status: {t.status || 'N/A'}</p>
              <p>Assigned to: {t.assigned_to.name || t.assigned_to.email}</p>
            </li>
          ))}
        </ul>
      )}

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* EDIT TASK MODAL */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Task</h3>
            <form className='create-form' onSubmit={handleUpdateTask}>
              <label htmlFor='title'>Title</label>
              <input
                id='title'
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />

              <label htmlFor='description'>Description</label>
              <textarea
                id='description'
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />

              <label htmlFor='due-date'>Due Date</label>
              <input
                id='due-date'
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <label htmlFor='priority'>Priority</label>
                <input
                  id='priority'
                  type="text"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                />
                <button type="button" onClick={handleGeneratePriority}>
                  Generate Priority
                </button>
              </div>

              <label htmlFor='status'>Status</label>
              <input
                id='status'
                type="text"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              />

              <label htmlFor='assign-to'>Assigned To</label>
              <select
                id='assign-to'
                onChange={(e) => {
                  setEditAssignedTo(Number(e.target.value));
                }}
              >
                {members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name || m.email}
                  </option>
                ))}
              </select>

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
                <button
                  type="button"
                  className="delete-button"
                  data-testid={`remove-task-${selectedTask?.id}`}
                  onClick={() => handleDeleteTask()}
                >
                  Remove Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;

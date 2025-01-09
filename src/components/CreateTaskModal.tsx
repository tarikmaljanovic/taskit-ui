// src/components/CreateTaskModal.tsx
import React, { useState } from 'react';
import { useCreateTask, useGeneratePriority } from '../api/queries/useTasks';
import { useProjectMembers, useProjectOwner } from '../api/queries/useProjects';
import '../styles/TaskList.css';

interface CreateTaskModalProps {
  projectId: number;
  onClose: () => void;
}

function CreateTaskModal({ projectId, onClose }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState(0);
  const { data: members } = useProjectMembers(projectId);
  const { data: owner } = useProjectOwner(projectId);

  const createTaskMutation = useCreateTask();
  const generatePriorityMutation = useGeneratePriority();

  // Submitting new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();

    createTaskMutation.mutate(
      {
        title,
        description,
        due_date: dueDate,
        priority,
        status,
        project: projectId,
        assigned_to: assignedTo,
      },
      {
        onSuccess: (task) => {
          onClose();
        },
        onError: (err) => {
          alert(`Error creating task: ${err}`);
        },
      }
    );
  };

  // Generating priority
  const handleGeneratePriority = async () => {
    try {
      const newPriority = await generatePriorityMutation.mutateAsync(description);
      setPriority(newPriority);
    } catch (err) {
      alert(`Error generating priority: ${err}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Create Task</h3>
        <form className='create-form' onSubmit={handleCreateTask}>
          <label htmlFor='title'>Title</label>
          <input
            id='title'
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor='description'>Description</label>
          <textarea
            id='description'
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label htmlFor='due-date'>Due Date</label>
          <input
            id='due-date'
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <label htmlFor='priority'>Priority</label>
            <input
              id='priority'
              type="text"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
            <button type="button" onClick={handleGeneratePriority}>
              Generate Priority
            </button>
          </div>

          <label htmlFor='status'>Status</label>
          <input
            id='status'
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          <label htmlFor='assign-to' defaultValue={0}>Assign To</label>
          <select id='assign-to' onChange={(e) =>{
            setAssignedTo(Number(e.target.value));
          }}>
            <option value={0}>Unassigned</option>
            {
                members?.map((m) => (
                    <option key={m.id} value={m.id}>
                    {m.name || m.email}
                    </option>
                ))
            }
            <option value={owner?.id}>{owner?.name}</option>
          </select>

          <div className="form-buttons">
            <button type="submit" className="submit-button">
              Create
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;

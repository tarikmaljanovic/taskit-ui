// src/components/CreateTaskModal.tsx
import React, { useState } from 'react';
import { useCreateTask, useGeneratePriority } from '../api/queries/useTasks.ts';
import { useProjectMembers } from '../api/queries/useProjects.ts';
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
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label>Priority</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
            <button type="button" onClick={handleGeneratePriority}>
              Generate Priority
            </button>
          </div>

          <label>Status</label>
          <input
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />

          <label>Assign To</label>
          <select onChange={(e) =>{
            setAssignedTo(Number(e.target.value));
          }}>
            {
                members?.map((m) => (
                    <option key={m.id} value={m.id}>
                    {m.name || m.email}
                    </option>
                ))
            }
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

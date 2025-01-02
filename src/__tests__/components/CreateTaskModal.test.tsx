import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateTaskModal from '../../components/CreateTaskModal';  // Adjust the import path if needed
import { MemoryRouter } from 'react-router-dom';

// Mocking React Query hooks
jest.mock("../../api/queries/useProjects", () => ({
  useProjectMembers: jest.fn(),
}));

jest.mock("../../api/queries/useTasks", () => ({
  useCreateTask: jest.fn(),
  useGeneratePriority: jest.fn(),
}));

// Mock data
const mockMembers = [
  { id: 1, name: 'Member 1' },
  { id: 2, name: 'Member 2' }
];

describe('CreateTaskModal', () => {
  beforeEach(() => {
    // Mock the responses of the hooks
    require("../../api/queries/useProjects").useProjectMembers.mockReturnValue({
      data: mockMembers
    });

    require("../../api/queries/useTasks").useCreateTask.mockReturnValue({
      mutate: jest.fn(),
    });

    require("../../api/queries/useTasks").useGeneratePriority.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue('High'),
    });
  });

  it('renders the modal with correct fields', () => {
    render(
      <MemoryRouter>
        <CreateTaskModal projectId={1} onClose={() => {}} />
      </MemoryRouter>
    );

    // Check if the modal and fields are rendered
    expect(screen.getByText('Create Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Assign To')).toBeInTheDocument();
  });

  it('submits the form successfully and calls createTaskMutation.mutate', async () => {
    const mockClose = jest.fn();

    render(
      <MemoryRouter>
        <CreateTaskModal projectId={1} onClose={mockClose} />
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Task description' } });
    fireEvent.change(screen.getByLabelText('Due Date'), { target: { value: '2024-12-31' } });
    fireEvent.change(screen.getByLabelText('Priority'), { target: { value: 'High' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'In Progress' } });
    fireEvent.change(screen.getByLabelText('Assign To'), { target: { value: '1' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    // Wait for the mutate function to be called
    await waitFor(() => {
      expect(require("../../api/queries/useTasks").useCreateTask().mutate).toHaveBeenCalled();
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    const mockClose = jest.fn();

    render(
      <MemoryRouter>
        <CreateTaskModal projectId={1} onClose={mockClose} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockClose).toHaveBeenCalled();
  });
});

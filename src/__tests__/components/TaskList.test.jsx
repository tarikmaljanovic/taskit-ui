import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../../components/TaskList';
import { MemoryRouter } from 'react-router-dom';
import exp from 'constants';
import { useDeleteTask, useProjectTasks } from '../../api/queries/useTasks';
import { act } from 'react';

// Mocking the React Query hooks
jest.mock("../../api/queries/useTasks", () => ({
  useCreateTask: jest.fn(),
  useDeleteTask: jest.fn(),
  useUpdateTask: jest.fn(),
  useGeneratePriority: jest.fn(),
  useProjectTasks: jest.fn(),
}));

jest.mock("../../api/queries/useProjects", () => ({
  useProjectMembers: jest.fn(),
}));

// Mock data
const mockMembers = [
  { id: 1, name: 'Member 1', email: 'member1@example.com' },
  { id: 2, name: 'Member 2', email: 'member2@example.com' }
];

let mockTasks = [
  { id: 1, title: 'Task 1', due_date: '2024-12-31', priority: 'High', status: 'In Progress', assigned_to: { name: 'Member 1', email: 'member1@example.com' }, project: { id: 1 } },
  { id: 2, title: 'Task 2', due_date: '2024-12-31', priority: 'Low', status: 'Completed', assigned_to: { name: 'Member 2', email: 'member2@example.com' }, project: { id: 1 } }
];

let mockUpdatedTasks = [
  { id: 2, title: 'Task 2', due_date: '2024-12-31', priority: 'Low', status: 'Completed', assigned_to: { name: 'Member 2' } },
];

describe("TaskList Component", () => {
  beforeEach(() => {
    // Mocking API responses
    require("../../api/queries/useProjects").useProjectMembers.mockReturnValue({ data: mockMembers });
    require("../../api/queries/useTasks").useDeleteTask.mockReturnValue({ mutate: jest.fn() });
    require("../../api/queries/useTasks").useUpdateTask.mockReturnValue({ mutate: jest.fn() });
    require("../../api/queries/useTasks").useCreateTask.mockReturnValue({ mutate: jest.fn() });
    require("../../api/queries/useTasks").useGeneratePriority.mockReturnValue({ mutateAsync: jest.fn().mockResolvedValue('High') });
    require("../../api/queries/useTasks").useProjectTasks.mockReturnValue({ data: mockTasks });
  });

  it("renders tasks correctly", () => {
    render(
      <MemoryRouter>
        <TaskList projectId={1} tasks={mockTasks} />
      </MemoryRouter>
    );
  
    // Check if tasks and their attributes are rendered
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  
    // Ensure there are multiple "Due: 2024-12-31" texts (one for each task)
    const dueDates = screen.getAllByText("Due: 2024-12-31");
    expect(dueDates.length).toBe(2); // We expect two tasks with this due date
  
    expect(screen.getByText("Priority: High")).toBeInTheDocument();
    expect(screen.getByText("Assigned to: Member 1")).toBeInTheDocument();
    expect(screen.getByText("Assigned to: Member 2")).toBeInTheDocument();
  });
  

  it("opens the edit task modal when a task is clicked", async () => {
    render(
      <MemoryRouter>
        <TaskList projectId={1} tasks={mockTasks} />
      </MemoryRouter>
    );

    // Click on Task 1
    fireEvent.click(screen.getByText("Task 1"));

    // Check if the modal is displayed with correct task data
    expect(screen.getByLabelText("Title").value).toBe("Task 1");
    expect(screen.getByLabelText("Priority").value).toBe("High");
    expect(screen.getByLabelText("Due Date").value).toBe("2024-12-31");
    expect(screen.getByLabelText("Assigned To").value).toBe("1");
  });

  it("submits the form and updates the task", async () => {
    const mockClose = jest.fn();
  
    // Mocking the mutate function of the update task mutation
    const mockMutate = jest.fn();
    jest.spyOn(require("../../api/queries/useTasks"), "useUpdateTask").mockReturnValue({
      mutate: mockMutate,
    });
  
    render(
      <MemoryRouter>
        <TaskList projectId={1} tasks={mockTasks} />
      </MemoryRouter>
    );
  
    // Open the edit modal for Task 1
    fireEvent.click(screen.getByText("Task 1"));
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: 'Updated Task' } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: 'Updated Description' } });
    fireEvent.change(screen.getByLabelText("Due Date"), { target: { value: '2024-12-31' } });
    fireEvent.change(screen.getByLabelText("Priority"), { target: { value: 'Medium' } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: 'In Progress' } });
    fireEvent.change(screen.getByLabelText("Assigned To"), { target: { value: '1' } });
  
    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: "Update" }));
  
    // Wait for the mutation to be called
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        id: 1,
        title: 'Updated Task',
        description: 'Updated Description',
        due_date: '2024-12-31',
        priority: 'Medium',
        status: 'In Progress',
        assigned_to: 1,
        project: 1,
      },
      {
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      });
    });
  });
  

  it("opens the create task modal when 'Create Task' is clicked", () => {
    render(
      <MemoryRouter>
        <TaskList projectId={1} />
      </MemoryRouter>
    );

    // Click to open the create task modal
    fireEvent.click(screen.getByRole("button", { name: "Create Task" }));

    // Check if the modal fields are present
    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("Due Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Priority")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("deletes a task when the 'Remove Button' is clicked", async() => {
    render(
      <MemoryRouter>
        <TaskList projectId={1} />
      </MemoryRouter>
    );
    // Ensure task 1 and task 2 are rendered
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();

    require("../../api/queries/useTasks").useProjectTasks.mockReturnValue({ data: mockUpdatedTasks });

    expect(screen.queryByText('Task 1')).toBeInTheDocument();
    expect(screen.queryByText('Task 2')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Task 1'));

    // Mock window.confirm to simulate clicking "OK"
    window.confirm = jest.fn().mockReturnValue(true);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Task' }));


    // Ensure the mutation is called correctly with task ID
    await waitFor(() => {
      expect(require('../../api/queries/useTasks').useDeleteTask().mutate).toHaveBeenCalledWith(1, expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }));
    });

    // Wait for the task list to be updated and Task 1 to be removed
    await waitFor(() => {
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });

    // Ensure Task 2 is still present
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  })
});

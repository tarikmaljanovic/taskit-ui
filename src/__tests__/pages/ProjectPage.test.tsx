import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectPage from '../../pages/ProjectPage';
import { MemoryRouter } from 'react-router-dom';  // Import MemoryRouter

// Mock the React Query hooks
jest.mock("../../api/queries/useProjects", () => ({
  useProjectById: jest.fn(),
  useProjectOwner: jest.fn(),
  useProjectMembers: jest.fn(),
  useDeleteProject: jest.fn(),
  useUpdateProject: jest.fn(),
  useAddMemberToProject: jest.fn(),
}));

jest.mock("../../api/queries/useTasks", () => ({
    useProjectTasks: jest.fn(),
    useDeleteTask: jest.fn(),
    useUpdateTask: jest.fn(),
    useGeneratePriority: jest.fn(),
}));

jest.mock("../../api/queries/useUser", () => ({
    useAllUsers: jest.fn(),
}));

// Mock data
const mockOwner = { id: 1, name: 'Owner Name' };
const mockProject = { id: 1, name: 'Test Project', description: 'Test Project Description', created_by: {id: 1, name: "Owner Name"} };
const mockMembers = [{ id: 2, name: 'Member 1' }, { id: 3, name: 'Member 2' }];
// Adding due_date to the tasks
const mockTasks = [
  { id: 1, title: 'Task 1', due_date: '2024-12-31T10:00:00Z', priority: 'High', status: 'In Progress', assigned_to: { name: 'Member 1' } },
  { id: 2, title: 'Task 2', due_date: '2024-12-31T11:00:00Z', priority: 'Low', status: 'Completed', assigned_to: { name: 'Member 2' } }
];

describe("ProjectPage", () => {
  beforeEach(() => {
    // Mocking the project-related data
    require("../../api/queries/useProjects").useProjectById.mockReturnValue({data: mockProject});
    require("../../api/queries/useProjects").useProjectOwner.mockReturnValue({data: mockOwner});
    require("../../api/queries/useProjects").useProjectMembers.mockReturnValue({data: mockMembers});
    require("../../api/queries/useTasks").useProjectTasks.mockReturnValue({data: mockTasks});
    require("../../api/queries/useUser").useAllUsers.mockReturnValue({data: [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }]});
    require("../../api/queries/useProjects").useDeleteProject.mockReturnValue({mutate: jest.fn()});
    require("../../api/queries/useProjects").useUpdateProject.mockReturnValue({mutate: jest.fn()});
    require("../../api/queries/useProjects").useAddMemberToProject.mockReturnValue({mutate: jest.fn()});
    require("../../api/queries/useTasks").useDeleteTask.mockReturnValue({mutate: jest.fn()});
    require("../../api/queries/useTasks").useUpdateTask.mockReturnValue({mutate: jest.fn()});
    require("../../api/queries/useTasks").useGeneratePriority.mockReturnValue({mutate: jest.fn()});
  });

  it("shows the owner controls if the user is the owner", () => {
    // Mock the user as the owner (store user in localStorage)
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Owner' }));

    render(
      <MemoryRouter initialEntries={['/project/1']}>
        <ProjectPage />
      </MemoryRouter>
    );

    // Check if owner controls (Add Member, Edit Project, Delete Project) are visible
    expect(screen.getByRole("button", { name: "Add Member" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Project" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Project" })).toBeInTheDocument();
  });

  it("does not show owner controls if the user is not the owner", () => {
    // Mock the user as a non-owner (store user in localStorage)
    localStorage.setItem('user', JSON.stringify({ id: 2, name: 'Non-Owner' }));

    render(
      <MemoryRouter initialEntries={['/project/1']}>
        <ProjectPage />
      </MemoryRouter>
    );

    // Check if owner controls are not visible for non-owner
    expect(screen.queryByRole("button", { name: "Add Member" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Edit Project" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete Project" })).toBeNull();
  });

  it("opens the edit project modal and updates the project", async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Owner' }));

    render(
      <MemoryRouter initialEntries={['/project/1']}>
        <ProjectPage />
      </MemoryRouter>
    );

    // Open the edit modal
    fireEvent.click(screen.getByRole("button", { name: "Edit Project" }));

    // Simulate editing the project and submitting the form
    fireEvent.change(screen.getByLabelText("Project Name"), { target: { value: 'Updated Project Name' } });
    fireEvent.change(screen.getByLabelText("Project Description"), { target: { value: 'Updated Description' } });
    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(require("../../api/queries/useProjects").useUpdateProject().mutate).toHaveBeenCalled();
    });
  });

  it("deletes the project", async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Owner' }));

    render(
      <MemoryRouter initialEntries={['/project/1']}>
        <ProjectPage />
      </MemoryRouter>
    );

    // Ensure the Delete Project button is displayed
    expect(screen.getByRole("button", { name: "Delete Project" })).toBeInTheDocument();

    // Mock window.confirm to return true for deletion
    window.confirm = jest.fn().mockReturnValue(true);

    // Simulate clicking the delete button
    fireEvent.click(screen.getByRole("button", { name: "Delete Project" }));

    // Ensure that deleteProjectMutation.mutate is called after confirming the deletion
    await waitFor(() => {
      expect(require("../../api/queries/useProjects").useDeleteProject().mutate).toHaveBeenCalled();
    });
  });
});

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../../pages/DashboardPage';
import { MemoryRouter } from 'react-router-dom';  // Import MemoryRouter

// Mock the React Query hooks
jest.mock("../../api/queries/useProjects", () => ({
  useMyProjects: jest.fn(),
  useOwnedProjects: jest.fn(),
  useCreateProject: jest.fn(),
}));

jest.mock("../../api/queries/useNotifications", () => ({
  useUserNotifications: jest.fn(),
}));

// Mock data
const mockMyProjects = [
  { id: 1, name: 'Project 1', description: 'Description 1' },
  { id: 2, name: 'Project 2', description: 'Description 2' },
];

const mockOwnedProjects = [
  { id: 3, name: 'Owned Project 1', description: 'Description 3' },
];

const mockNotifications = [
  { id: 1, message: 'New Notification', timestamp: '2024-12-30T10:00:00Z' },
];

describe("DashboardPage", () => {
  beforeEach(() => {
    require("../../api/queries/useProjects").useMyProjects.mockReturnValue({ data: mockMyProjects });
    require("../../api/queries/useProjects").useOwnedProjects.mockReturnValue({ data: mockOwnedProjects });
    require("../../api/queries/useNotifications").useUserNotifications.mockReturnValue({ data: mockNotifications });
  });

  it("renders the dashboard page correctly", () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    );

    // Check if the dashboard page content is displayed
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("My Projects")).toBeInTheDocument();
    expect(screen.getByText("Projects I Created")).toBeInTheDocument();
    expect(screen.getByText("Owned Project 1")).toBeInTheDocument();

    // Check if the mocked project data is rendered
    expect(screen.getByText("Project 1")).toBeInTheDocument();
    expect(screen.getByText("Project 2")).toBeInTheDocument();

    // Check if the notification is rendered
    expect(screen.getByText("New Notification")).toBeInTheDocument();
  });
});

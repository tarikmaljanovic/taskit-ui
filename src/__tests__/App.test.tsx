import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom'; // Use MemoryRouter for routing in tests
import App from '../App'; // Adjust the import as necessary

// Mock pages
jest.mock('../pages/LoginPage', () => () => <div data-testid="login-page">Mocked LoginPage</div>);
jest.mock('../pages/DashboardPage', () => () => <div data-testid="dashboard-page">Mocked DashboardPage</div>);
jest.mock('../pages/ProjectPage', () => () => <div data-testid="project-page">Mocked ProjectPage</div>);
jest.mock('../components/layout/Navbar', () => () => <div data-testid="navbar">Mocked Navbar</div>);
jest.mock('../pages/NotFoundPage', () => () => <div data-testid="not-found-page">Mocked NotFoundPage</div>);

describe('App Component', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
          {ui}
      </QueryClientProvider>
    );
  };

  it('renders the LoginPage for the root route "/"', () => {
    renderWithProviders(<App />);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders the DashboardPage for the "/dashboard" route', () => {
    window.history.pushState({}, "DashboardPage", "/dashboard");
    renderWithProviders(<App />);
    expect(screen.getByTestId("dashboard-page")).toBeInTheDocument();
  });

  it('renders the ProjectPage for the "/project/:projectId" route', () => {
    window.history.pushState({}, "ProjectPage", "/project/1");
    renderWithProviders(<App />);
    expect(screen.getByTestId("project-page")).toBeInTheDocument();
  });

  it('renders NotFoundPage for a non-existent route', () => {
    window.history.pushState({}, "NotFoundPage", "/nothing");
    renderWithProviders(<App />);
    expect(screen.getByTestId("not-found-page")).toBeInTheDocument();
  });

  it('renders Navbar on routes other than "/"', () => {
    window.history.pushState({}, "DashboardPage", "/dashboard");
    renderWithProviders(<App />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });
});

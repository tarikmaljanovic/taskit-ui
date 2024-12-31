import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../../../components/layout/Navbar';
import { MemoryRouter } from 'react-router-dom';

// Mocking localStorage
beforeEach(() => {
  // Set initial item in localStorage
  localStorage.setItem('user', JSON.stringify({ id: 1, name: 'User' }));
});

describe('Navbar', () => {
  it('renders Navbar correctly', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Check if the Navbar renders correctly
    expect(screen.getByText('TaskIt')).toBeInTheDocument();
    expect(screen.getByText('Log out')).toBeInTheDocument();
  });

  it('contains the correct links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Check that the "TaskIt" link leads to "/dashboard"
    const taskItLink = screen.getByText('TaskIt');
    expect(taskItLink).toHaveAttribute('href', '/dashboard');

    // Check that the "Log out" link leads to "/"
    const logOutLink = screen.getByText('Log out');
    expect(logOutLink).toHaveAttribute('href', '/');
  });

  it('removes the user from localStorage when log out is clicked', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Before clicking, check that localStorage contains the user
    expect(localStorage.getItem('user')).toBeTruthy();

    // Simulate the Log out click
    fireEvent.click(screen.getByText('Log out'));

    // Check if the user is removed from localStorage
    expect(localStorage.getItem('user')).toBeNull();
  });
});

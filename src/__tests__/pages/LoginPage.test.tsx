import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '../../pages/LoginPage';
import { MemoryRouter } from 'react-router-dom';  // Import MemoryRouter

// Mock the React Query hooks
jest.mock("../../api/queries/useUser", () => ({
  useLogin: jest.fn(),
  useCreateUser: jest.fn(),
}));

// Mock data
const mockLoginResponse = { id: 1, name: 'John Doe' };
const mockCreateUserResponse = { id: 1, name: 'John Doe' };

describe("LoginPage", () => {
  beforeEach(() => {
    require("../../api/queries/useUser").useLogin.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(mockLoginResponse),
      isError: false,
      error: null,
    });

    require("../../api/queries/useUser").useCreateUser.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(mockCreateUserResponse),
      isError: false,
      error: null,
    });
  });

  it("renders the login form by default", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Check if the login form is rendered
    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("submits the login form successfully", async () => {
    // Mock the useLogin hook with the mutateAsync function returning the mock login response
    const mockMutateAsync = jest.fn().mockResolvedValue(mockLoginResponse);
    require("../../api/queries/useUser").useLogin.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isError: false,
      error: null,
    });
  
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  
    // Fill in the login form
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: 'password123' } });
  
    // Submit the login form
    fireEvent.click(screen.getByRole("button", { name: "Log In" }));
  
    // Wait for the mutateAsync call to be triggered and verify the arguments
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  
    // Check if the user is saved to localStorage
    await waitFor(() => expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockLoginResponse)));
  });
  


  it("displays an error message if login fails", async () => {
    // Simulate a failed login
    require("../../api/queries/useUser").useLogin.mockReturnValue({
      mutateAsync: jest.fn().mockRejectedValue(new Error("Invalid credentials")),
      isError: true,
      error: new Error("Invalid credentials"),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByRole("button", { name: "Log In" }));

    await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
  });

  it("toggles to the registration form", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Register" }));

    // Check if registration form fields are shown
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
  });
});

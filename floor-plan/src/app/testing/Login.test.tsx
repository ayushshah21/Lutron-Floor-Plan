import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../login/page';
import mockRouter from 'next-router-mock';

jest.mock('next/navigation', () => require('next-router-mock'));

describe('Login Page Tests', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/login');
  });

  test('should render the login page', () => {
    render(<Login />);
    const heading = screen.getByText("Sign into Lutron Floor Plan");
    expect(heading).toBeInTheDocument();
  });
});

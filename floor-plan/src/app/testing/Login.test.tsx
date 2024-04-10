import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../login/page';

describe('Login Page Tests', () => {
  test('simple test', () => {
    const heading = "HI";
    expect(heading).toBe("HI");
  });

  test('should render the login page', () => {
    render(<Login />);
    const heading = screen.getByText("Sign into Lutron Floor Plan");
    expect(heading); 
  });
});

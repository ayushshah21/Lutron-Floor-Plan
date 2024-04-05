import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import Login from '../login/page'; 

describe('Login Page Tests', () => {
    // Right now, this is test is still giving errors due to testing configurations in NextJS
    test('should render the login page', () => {
        render(<Login />);
        const heading = screen.getByText("Sign into Lutron Floor Plan");
        expect(heading); 
    });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../home/page';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

describe('Home Page Tests', () => {
    beforeEach(() => {
        mockRouter.setCurrentUrl('/home'); // Setup the initial URL
    });

    test('Home page heading', () => {
        render(<Home/>);
        const heading = screen.getByText("Search floor plans");
        expect(heading).toBeInTheDocument();
    });
});

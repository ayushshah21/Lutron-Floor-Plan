import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Editor from '../editor/page'
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

describe('Editor Page Tests', () => {
    beforeEach(() => {
        mockRouter.setCurrentUrl('/editor'); // Setup the initial URL
    });

    test('Render editor page', () => {
        render(<Editor/>);
    });
});

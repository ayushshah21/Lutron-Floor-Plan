import React from 'react'
import Home from '../home/page'

describe('Home Page Tests', () => {
    // Check that home page renders
    it('renders', () => {

        // see: https://on.cypress.io/mounting-react
        cy.mount(<Home />)
    })

    // Create test to pass in a mock PDF into the import 
    // Check that it passes either by (no errors are returned)
})
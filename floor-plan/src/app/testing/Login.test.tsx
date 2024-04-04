import React from 'react'
import Login from '../login/page'

describe('Login Page Tests', () => {
    // Fix this test as this test only worked for NextAuth when made by Amelia
    // Look into Jest Mocks
    it('renders', () => {

        // see: https://on.cypress.io/mounting-react
        cy.mount(<Login />)
    })
})
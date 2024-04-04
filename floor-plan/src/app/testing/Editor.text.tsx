import React from 'react'
import Editor from '../editor/page'

describe('Editor Page Tests', () => {
    it('renders', () => {

        // see: https://on.cypress.io/mounting-react
        cy.mount(<Editor />)
    })
})
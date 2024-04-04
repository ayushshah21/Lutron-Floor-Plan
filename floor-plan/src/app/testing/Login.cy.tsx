import React from 'react'
import Login from '../login/page'

// Testing Firebase Auth
describe('<Login />', () => {
  it('renders', () => { 
    // Fix this test as this test only worked for NextAuth when made by Amelia
    // Now we're using Firebase Auth
    // Look into Jest Mocks
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Login />)
  })
})
describe("Login page", () => {
  // Visit localhost (needs another instance running)
  before(() => {
    cy.log(`Visiting http://localhost:3000`)
    cy.visit("http://localhost:3000")
  });

  it(`Make sure login contents exist`, () => {
    // Check login box exists
    cy.get('#loginBox').should('exist');
    
    // Check that login button exists and can be clicked on (taking us to google sign in pop up)
    cy.get('#loginButton').should('exist').click();
  });

  // Only run this test if the test above passed
  // Cypress test should typically run independently, probably should combine this test with above
  it(`Check that we redirected to home page after logging in`, () => {
    // Check that url is now on /home
    cy.location('pathname').should('eq', '/home');

    // Check that sidebar exists: shared with me, recent ... 
    cy.get('#navSidebar').should('exist');

    // Click on import button
    cy.get('#importButton').should('exist').click();
  });

  // Messed up right now, importing file takes us to a weird url: http://localhost:3000/editor?pdf=https%3A%2F%2Ffirebasestorage.googleapis.com%2Fv0%2Fb%2Flutron-floor-plan-69652.appspot.com%2Fo%2Ffloorplans%252FW3VxAjKBu5PiW0ph4pxXwYNA78g1%252Ffloorplan.pdf%3Falt%3Dmedia%26token%3D364b25a5-9851-44c1-8864-5b2714c38caf
  // Floor uploading not completely finished as Ayush switched to pdfskit
  it(`Check that we redirected to editor page`, () => {
    // Check that url is now on /editor
    cy.location('pathname').should('eq', '/editor');
  });


  
  // Amelia's code
  // it("Triggers email sign-in when login button is clicked", () => {
  //   // Check that button exists
  //   cy.get('#loginButton').should('exist').click();

  //   // Check that after clicking it, it should pull up a sign in pop up

    
  // });
  // it("Login with Google", () => {
  //   const username = Cypress.env("GOOGLE_USER")
  //   const password = Cypress.env("GOOGLE_PW")
  //   const loginUrl = Cypress.env("SITE_NAME")
  //   const cookieName = Cypress.env("COOKIE_NAME")
  //   const socialLoginOptions = {
  //     username,
  //     password,
  //     loginUrl,
  //     headless: true,
  //     logs: false,
  //     isPopup: true,
  //     loginSelector: `a[href="${Cypress.env(
  //       "SITE_NAME"
  //     )}/api/auth/signin/google"]`,
  //     postLoginSelector: ".unread-count",
  //   }

  //   return cy
  //     .task("GoogleSocialLogin", socialLoginOptions)
  //     .then(({ cookies }) => {
  //       cy.clearCookies()

  //       const cookie = cookies
  //         .filter((cookie) => cookie.name === cookieName)
  //         .pop()
  //       if (cookie) {
  //         cy.setCookie(cookie.name, cookie.value, {
  //           domain: cookie.domain,
  //           expiry: cookie.expires,
  //           httpOnly: cookie.httpOnly,
  //           path: cookie.path,
  //           secure: cookie.secure,
  //         })

  //         Cypress.Cookies.defaults({
  //           preserve: cookieName,
  //         })

  //         // remove the two lines below if you need to stay logged in
  //         // for your remaining tests
  //         cy.visit("/api/auth/signout")
  //         cy.get("form").submit()
  //       }
  //     })
  // })
})
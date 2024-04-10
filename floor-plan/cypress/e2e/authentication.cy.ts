describe("Login page", () => {
  // Visit localhost (needs another instance running)
  before(() => {
    cy.log(`Visiting http://localhost:3000`)
    cy.visit("http://localhost:3000")
  });

  it(`Test going from login to home to editor page`, () => {
    // Login page
    // Check login box exists
    cy.get('#loginBox').should('exist');
    
    // Check that login button exists and can be clicked on (taking us to google sign in pop up)
    cy.get('#loginButton').should('exist').click();

    // Home page
    // Check that url is now on /home
    // Give user time to login with their credentials
    cy.location('pathname', { timeout: 20000 }).should('eq', '/home');

    // Check that sidebar exists: shared with me, recent ... 
    cy.get('#navSidebar').should('exist');

    // Click on import button
    cy.get('#importButton').should('exist').click();

    // Editor page
    // Check that url is now on /editor after importing a file
    // Give user time to upload a floorplan pdf
    cy.location('pathname', { timeout: 20000 }).should('eq', '/editor');
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
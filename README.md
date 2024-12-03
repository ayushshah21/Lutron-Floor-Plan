# Capstone: Lutron Floor Plan

A Miro-like multi-user application where users can upload floor plans (ceiling plans) and annotate it with other users in real-time using stamps / icons (representing sensors, shades, light fixtures, etc). 

### **Team members:** 
- Ivan Zhang
- Zoe Sherman
- Ayush Shah
- Amelia Gankhuyag

### **Lutron Sponsors:** 
- Hannah Fabian
- Wesley Breisch

### **Professor:**
- Professor Alan Jeffery

### **Tech Stack:** 
- Front-End: Next.js, React, TypeScript
- Back-End: Firebase, Socket.IO, Express
- Testing: Cypress, Jest
- Libraries: Fabric.js, react-pdf

## Features
- [X] The app must allow users to upload a new floorplan in the web app.
- [X] The app must allow users to view a floorplan in the web app.
- [X] The app must allow users to use drawing tools to annotate a floorplan with devices and controls to create a system layout.
- [X] The app must allow for a multi-user experience wherein any updates made to the floorplan should instantly be visible on all users’ floorplans (i.e., the state of the floorplan is synchronized across all users currently looking at it).
- [X] The app must allow users to export an annotated floorplan for use in other common non-Lutron design tools (e.g., CAD).
- [X] The app must be unit & integration tested using modern web project best practices (e.g., Jest, Cypress, etc.)
- [X] Nice to have: the app should be able to intake an existing Lutron floorplan (Must be in PDF format)

## How to run application
- Run npm install to get dependencies
- Run npm run dev to start application

## How to run Cypress Tests
- Follow steps above with installing dependencies with npm i 
- Run npm run test:e2e:open to open Cypress test (this makes a Cypress pop up)
- Run npm run test:e2e:run to run Cypress test or run the tests manually in the pop up
- Make sure another instance of Lutron-floor-plan (localhost) is running with npm run dev in conjunction with Cypress running

## How to run Jest Tests
- Install Jest Runner extension on VSCode
- This will make run | debug options appear above Jest test, simplifying the process 




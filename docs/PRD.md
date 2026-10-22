# PRODUCT REQUIREMENTS DOCUMENT

## Project Name
MediTrack — Patient Appointment and Health Information System

**Version:** 1.0  
**Status:** Planning  
**Product Type:** Full-Stack Healthcare Web Application  
**Primary Users:** Patients and Healthcare Staff

## 1. Product Overview

MediTrack is a web-based healthcare application designed to help patients manage appointments and help healthcare staff organise appointment-related workflows.

The application will provide a patient-facing interface and a staff-facing dashboard. It will use a TypeScript-based frontend and backend, supported by a relational database.

The project will also provide an opportunity to explore healthcare information management, authentication, data quality, and operational reporting.

The initial version will be an educational prototype using fictional data and test accounts.

## 2. Problem Statement

Patients may experience difficulties booking appointments, keeping track of scheduled visits, and accessing appointment information.

Healthcare facilities may also face administrative challenges when managing appointment records and monitoring attendance.

MediTrack aims to explore how a digital appointment management application can make these processes more organised, accessible, and efficient.

## 3. Product Goals

The product aims to:

1. Allow patients to register and sign in securely.
2. Allow patients to create and manage appointments.
3. Provide healthcare staff with tools to manage appointments.
4. Store application data in a structured database.
5. Protect user accounts and prevent unauthorised access.
6. Produce basic operational reports about appointment activity.
7. Demonstrate full-stack development skills using TypeScript and Node.js.

## 4. Target Users

### 4.1 Patients
Patients will be able to create accounts, sign in, view available appointment options, book appointments, and manage their bookings.

### 4.2 Healthcare Staff
Authorised staff will be able to view and manage appointments according to their assigned permissions.

### 4.3 Administrators
Administrators will manage staff access and oversee appropriate operational functions.

Administrative access will be restricted according to role and responsibility.

## 5. Scope of the Minimum Viable Product (MVP)

The MVP will focus on authentication and appointment management.

### 5.1 User Registration
The system shall allow a patient to:
- Register using an email address and password.
- Provide the minimum information required to create an account.
- Receive appropriate feedback when registration fails.
- Be prevented from registering multiple accounts with the same email address.

### 5.2 User Authentication
The system shall allow registered users to:
- Sign in with their credentials.
- Sign out securely.
- Maintain an authenticated session.
- Receive a clear error message when sign-in fails.
- Access only the functions permitted by their role.

### 5.3 Patient Dashboard
The patient dashboard shall allow patients to:
- View their upcoming appointments.
- View previous appointments.
- Book an available appointment.
- Cancel an eligible appointment.
- View the current status of each appointment.

Patients must not be able to view or modify another patient's records.

### 5.4 Appointment Management
The system shall allow authorised users to:
- Create appointment records.
- Associate appointments with the correct patient.
- Record appointment date and time.
- Record the relevant department or appointment type.
- Track appointment status.
- Prevent conflicting bookings for the same appointment slot.

### 5.5 Staff Dashboard
Authorised staff shall be able to:
- View appointments relevant to their role.
- Search and filter appointment records.
- Update appointment statuses.
- Review daily appointment schedules.

### 5.6 Basic Reporting
The application shall provide authorised staff with summary information such as:
- Total appointments.
- Completed appointments.
- Cancelled appointments.
- Missed appointments.
- Appointment counts by date or department.

The system shall use clearly defined rules for calculating reporting metrics.

## 6. Proposed Technology Stack

### Frontend
- React
- TypeScript
- Next.js
- CSS or a suitable component library

### Backend
- Node.js
- TypeScript
- Express.js
- REST API architecture

### Database
- PostgreSQL
- Prisma ORM

### Development Tools
- Git
- GitHub
- Visual Studio Code
- Automated testing tools

The stack may be refined during technical design.

## 7. Data Model

The initial database may contain the following entities.

### User
- User ID
- Email address
- Password hash
- Role
- Account creation date

### Patient Profile
- Patient profile ID
- User ID
- Minimum additional information required for appointment management

### Appointment
- Appointment ID
- Patient ID
- Department or appointment type
- Appointment date and time
- Appointment status
- Creation date

### Staff Profile
- Staff profile ID
- User ID
- Assigned role or department, where applicable

Relationships and required fields will be finalised during database design.

## 8. Security and Privacy Requirements

Because the product concerns healthcare, privacy and security are core requirements.

The system shall:
- Never store passwords in plaintext.
- Use an established password-hashing algorithm.
- Protect authenticated sessions.
- Enforce server-side authorisation checks.
- Validate user input on the server.
- Protect against common web application vulnerabilities.
- Use HTTPS in deployed environments.
- Avoid exposing sensitive information in logs or error messages.
- Restrict access to patient information by role and ownership.
- Store secrets outside the source code.
- Use fictional data during development and testing.

The prototype will not be used to store real patient information.

Before any real-world deployment, the application would require appropriate privacy, security, legal, clinical, and operational review.

## 9. Non-Functional Requirements

### Usability
The application should provide a clear and accessible interface that works on mobile devices and desktop computers.

### Reliability
The system should handle invalid requests and unexpected errors without exposing sensitive information.

### Maintainability
The codebase should use a consistent TypeScript structure, meaningful names, and automated tests.

### Performance
Common actions, such as signing in and viewing appointments, should respond promptly under the expected prototype workload.

### Accessibility
The interface should support keyboard navigation, readable text, and appropriate labels for form controls.

## 10. Success Metrics

The MVP will be considered successful when:

- A new patient can register.
- A registered patient can sign in and sign out.
- Unauthenticated users cannot access protected patient pages.
- Patients can book and view their own appointments.
- Patients cannot access another patient's appointments.
- Authorised staff can manage appointment statuses.
- Conflicting appointment bookings are rejected.
- Basic appointment reports display accurate results.
- Automated tests cover the main authentication and appointment workflows.

## 11. Out of Scope for the MVP

The first version will not include:
- Online medical consultations.
- Electronic prescriptions.
- Medical diagnosis or treatment recommendations.
- Full electronic health records.
- Payment processing.
- Insurance claims.
- Integration with external hospital systems.
- Real patient data.
- Automated medical decision-making.

These features may be evaluated in later versions after the core application is established.

## 12. Future Enhancements

Possible future enhancements include:
- Appointment reminders.
- Additional reporting and analytics.
- Integration with laboratory information systems.
- Electronic health record integration.
- More advanced administrative reporting.
- Appropriate interoperability standards.

Any integration involving real healthcare information would require additional privacy, security, and interoperability planning.

## 13. Project Milestones

### Phase 1: Requirements and Design
Finalise the PRD, user journeys, and initial database model.

### Phase 2: Project Setup
Create the frontend and backend structure, configure TypeScript, and connect the development database.

### Phase 3: Authentication
Implement registration, sign-in, sign-out, and access controls.

### Phase 4: Appointment Management
Implement appointment creation, viewing, cancellation, and staff management.

### Phase 5: Reporting
Develop basic appointment summaries and operational metrics.

### Phase 6: Testing and Documentation
Test important workflows, document setup instructions, and publish the project code to GitHub.

## 14. Expected Outcome

MediTrack will provide a foundation for learning full-stack development while exploring healthcare information systems and healthcare data analysis.

The completed educational prototype will demonstrate how a frontend, backend, database, and authentication system work together to support a healthcare-related workflow.
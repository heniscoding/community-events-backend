# Community Events Backend

Welcome to the **Community Events Backend**! This backend server is designed to support the Community Events platform, providing secure APIs for user authentication, event management, and user roles. The server is built using Node.js, Express, and MongoDB to manage data related to events, users, and registrations.

A hosted version of the backend server can be found at [community-events-backend-gv6v.onrender.com](https://community-events-backend-gv6v.onrender.com/).

## Table of Contents
- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [Dependencies](#dependencies)
- [License](#license)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Description

The **Community Events Backend** provides the core functionality for the Community Events platform. It includes APIs for managing events, handling user registrations, authentication using JSON Web Tokens (JWT), and role-based permissions to differentiate between staff members and regular users.

The main features include:
- User authentication using JWT.
- CRUD operations for events with image upload support.
- Event registration and deregistration.
- Role-based permissions for managing events.

This backend server uses **Express** for creating the API routes and **MongoDB** with **Mongoose** for data persistence.

## Installation

To run this project locally, follow the steps below:

### Prerequisites

Ensure you have Node.js and npm installed on your system. You can download them from [nodejs.org](https://nodejs.org/).

### Steps to Install

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/heniscoding/community-events-backend.git
    ```

2. **Navigate to the Project Directory**:

    ```bash
    cd community-events-backend
    ```

3. **Install Dependencies**:

    ```bash
    npm install
    ```

4. **Set up Environment Variables**:

    Create a `.env` file in the root directory and add the following variables:

    ```env
    PORT=5000
    MONGODB_URI=your_mongo_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```

5. **Start the Server**:

    ```bash
    npm start
    ```

    or in development mode with hot-reloading:

    ```bash
    npm run dev
    ```

After running these commands, the server should be accessible at `http://localhost:5000`.

## Usage

Once the backend is running, it can be used in conjunction with the front-end platform or independently for testing purposes.

### Endpoints Overview
- **Authentication**: Users can register and log in to receive JWT tokens for secure access.
- **Event Management**: Staff members can create, update, and delete events.
- **Event Registration**: Users can register for available events or unregister.

### API Endpoints

- **Authentication**
  - `POST /api/register` - Register a new user.
  - `POST /api/login` - Log in and receive an authentication token.

- **Events**
  - `GET /api/events` - Retrieve a list of all events.
  - `GET /api/events/:id` - Get details of a specific event.
  - `POST /api/events` - Create a new event (staff only).
  - `DELETE /api/events/:id` - Delete an event (staff only).

- **Registrations**
  - `POST /api/events/:id/signup` - Register for an event.
  - `DELETE /api/events/:id/signup` - Unregister from an event.
  - `GET /api/events/my-registrations` - Get all events the authenticated user is registered for.

### Folder Structure
- **`models/`**: Contains the Mongoose models (User, Event, Registration).
- **`routes/`**: Defines the API endpoints.
- **`middleware/`**: Authentication and authorization middlewares.
- **`uploads/`**: Stores uploaded event images.

## Features

- **User Authentication**: Secure authentication with JWT to protect routes and sessions.
- **Role-Based Permissions**: Only staff members can create or manage events.
- **Image Uploads**: Event images are handled with **Multer** and stored in the `uploads/` directory.
- **Pagination**: Supports pagination for event listings to enhance performance.

## Contributing

We welcome contributions from the community! If you'd like to contribute:

1. **Fork the Project**.
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`).
4. **Push to the Branch** (`git push origin feature/AmazingFeature`).
5. **Open a Pull Request**.

For questions about contributing, feel free to open an issue or start a discussion.

## Dependencies

The following major dependencies are used in this project:

- **[Express](https://expressjs.com/)** - Web framework for Node.js.
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling for Node.js.
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - For creating and verifying JWTs.
- **[Multer](https://github.com/expressjs/multer)** - Middleware for handling `multipart/form-data` for file uploads.

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

## Author

- **Henry Alderslade** - [GitHub Profile](https://github.com/heniscoding)

If you have any questions or suggestions, please feel free to contact me via GitHub.

## Acknowledgments

- **Node.js Documentation**: The official Node.js documentation was instrumental in the development of this project.
- **Mongoose Documentation**: For MongoDB modeling and data handling.
- **Community Contributors**: Thank you to those who provided valuable insights, feature requests, and bug reports that helped improve this project.

Thank you for your interest in the **Community Events Backend**! Feel free to explore the code, report issues, or contribute to the project.

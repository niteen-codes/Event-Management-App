# Event Management Application

## Overview
The Event Management Application is a full-stack web application that allows users to create, manage, and attend events. It includes features like user authentication, event creation, event filtering, and real-time updates using WebSocket.

## Key Features:
### User Authentication:
- Users can register, log in, and log out.
- Guest users can log in with limited functionality.

### Event Management:
- Authenticated users can create, update, and cancel events.
- Users can attend or leave events.

### Event Filtering:
- Users can filter events by category and date.

### Real-Time Updates:
- Real-time updates for new, updated, and cancelled events using WebSocket.

### Responsive Design:
- The application is designed to work seamlessly on both desktop and mobile devices.

## Technologies Used
### Frontend:
- **React**: A JavaScript library for building user interfaces.
- **React Router**: For client-side routing.
- **Axios**: For making HTTP requests to the backend.
- **Socket.IO Client**: For real-time communication with the backend.
- **CSS**: For styling the application.

### Backend:
- **Node.js**: A JavaScript runtime for building the server.
- **Express**: A web framework for Node.js.
- **MongoDB**: A NoSQL database for storing user and event data.
- **Mongoose**: An ODM (Object Data Modeling) library for MongoDB.
- **JSON Web Token (JWT)**: For user authentication and authorization.
- **Socket.IO**: For real-time communication with the frontend.

### Tools:
- **Postman**: For testing API endpoints.
- **VS Code**: For code editing and debugging.

## Installation and Setup
### Prerequisites:
- Node.js 
- MongoDB 
- Git 

### Steps to Run the Application:
#### Clone the Repository:
```bash
git clone https://github.com/your-username/event-management-app.git
cd event-management-app
```

#### Install Dependencies:
Navigate to the frontend and backend folders and install dependencies for both:
```bash
cd backend
npm install
cd ../frontend
npm install
```

#### Set Up Environment Variables:
Create a `.env` file in the backend folder and add the following variables:
```env
MONGO_URI=mongodb+srv://niteenjha190:bZsohrNSqj7SgTVI@eventmanagementdb.h9ac6.mongodb.net/?retryWrites=true&w=majority&appName=eventManagementDb
JWT_SECRET=e7f3c2a89b2b457f92d5b6d71a8e4f9d8235a13fbbf3a45b6d76e5b9a63c8a7d
PORT=5000
```

#### Start the Backend Server:
Navigate to the backend folder and start the server:
```bash
cd backend
npm start
```
The backend server will run on `http://localhost:5000`.

#### Start the Frontend Application:
Navigate to the frontend folder and start the React application:
```bash
cd frontend
npm start
```
The frontend application will run on `http://localhost:3000`.

#### Access the Application:
Open your browser and go to `http://localhost:3000` to access the application.

## API Endpoints
### Authentication:
- **POST** `/api/auth/register`: Register a new user.
- **POST** `/api/auth/login`: Log in an existing user.
- **POST** `/api/auth/guest-login`: Log in as a guest user.

### Events:
- **GET** `/api/events`: Fetch all events (with optional filters for category and date).
- **POST** `/api/events`: Create a new event.
- **POST** `/api/events/:id/cancel`: Cancel an event.
- **POST** `/api/events/:eventId/attend`: Attend an event.
- **POST** `/api/events/:eventId/leave`: Leave an event.

## Folder Structure
### Frontend:
```
frontend/
├── public/
├── src/
│   ├── components/       # Reusable components (e.g., EventList, EventForm, Navbar)
│   ├── pages/            # Pages (e.g., Login, Register, Dashboard)
│   ├── App.js            # Main application component
│   ├── index.js          # Entry point
│   └── ...
├── package.json
└── ...
```
### Backend:
```
backend/
├── controllers/          # Logic for handling API requests
├── models/               # MongoDB models (e.g., User, Event)
├── routes/               # API routes
├── middleware/           # Middleware (e.g., authentication)
├── app.js                # Main application file
├── server.js             # Server setup
├── package.json
└── ...
```

## Screenshots
### Login Page:
![Login Page](#)
### Dashboard:
![Dashboard](#)
### Create Event:
![Create Event](#)

## Contributing
Contributions are welcome! If you'd like to contribute to this project, please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contact
For any questions or feedback, feel free to reach out:
- **Email**: your-email@example.com
- **GitHub**: [your-username](https://github.com/your-username)

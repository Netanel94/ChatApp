# ChatApp

A real-time chat application that enables users to communicate instantly with friends and colleagues.

<img width="1280" height="762" alt="image" src="https://github.com/user-attachments/assets/28a29088-e47f-44bf-982f-064a69f84bbd" />




## 🚀 Features

- **Real-time messaging** - Instant message delivery using WebSockets
- **User authentication** - Secure login and registration system
- **Private conversations** - One-on-one messaging between users
- **Group chats** - Create and participate in group conversations
- **Message history** - Persistent chat history storage
- **Online status** - See when users are online/offline

## 🛠️ Technologies Used

- **Frontend**: React.js with Zustand for state management (Vite build tool)
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: MongoDB with Studio 3T for database management
- **Real-time Communication**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer for handling file uploads

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16.0.0 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [TypeScript](https://www.typescriptlang.org/) and ts-node (`npm install -g typescript ts-node`)
- [MongoDB](https://www.mongodb.com/) (local installation)
- [Studio 3T](https://studio3t.com/) (recommended MongoDB GUI client)

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Netanel94/ChatApp.git
cd ChatApp
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
# or wherever your backend code is located
```

Install backend dependencies:
```bash
npm install
```

Create a `.env` file in the backend directory and add your environment variables:
```env
ACCESS_TOKEN_SECRET=your_jwt_secret_key_here
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../frontend
# or wherever your React app is located
```

Install frontend dependencies:
```bash
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_PUBLIC_FOLDER=http://localhost:8000/images/
```

## 🚀 Running the Application

### Option 1: Run Backend and Frontend Separately

**Start the Backend Server:**
```bash
cd backend
npx ts-node index.ts
```
The backend server will run on `http://localhost:8000`

**Start the Frontend (in a new terminal):**
```bash
cd frontend
npm run dev
# Vite development server
```
The React app will run on `http://localhost:5173`

### Option 2: Run Both with Concurrently (if configured)

If you have a script to run both simultaneously:
```bash
npm run dev
# This would run both backend and frontend concurrently
```

## 🗃️ Database Setup

### Using Studio 3T with Local MongoDB
1. Make sure MongoDB is installed and running on your machine
2. Open Studio 3T
3. Create a new connection:
   - Connection Name: `ChatApp Local`
   - Server: `localhost` or `127.0.0.1`
   - Port: `27017` (default MongoDB port)
4. Connect to your MongoDB instance
5. The application will automatically create the `ChatUsersDB` database and required collections when you first run it
6. You can view and manage your data through Studio 3T's interface

### Database Schema
The application uses the following main collections in the `ChatUsersDB` database:
- `users` - User accounts and authentication data
- `messages` - Chat messages and metadata
- `conversations` - Chat room/conversation information

You can explore these collections in Studio 3T once the application creates them.





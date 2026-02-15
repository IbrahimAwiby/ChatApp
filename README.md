# 💬 Real-Time Chat Application

A full-stack real-time chat application built with **React 19, Node.js, Express, Socket.IO, and MongoDB**.  
Features include instant messaging, image sharing, online status tracking, and a beautiful, responsive UI with multiple themes.

---

## 🚀 Live Demo

Coming Soon...

---

## ✨ Features

### 🔹 Core Features
- Real-time messaging with Socket.IO
- Image sharing with preview and download options
- Online/offline user status with real-time updates
- Unread message counts and notifications
- Search users functionality
- Saved Messages (chat with yourself)
- Message history with date separators

### 🔹 User Experience
- Multiple themes (Purple, Blue, Green, Amber, Rose, Dark)
- Responsive design (mobile & desktop)
- Loading skeletons for better UX
- Toast notifications
- Message options (copy, delete)
- Image modal with download capability
- Right sidebar with user profile & shared media

### 🔹 Profile Features
- Edit profile (name, bio, profile picture)
- View profile picture fullscreen
- Shared media gallery
- User bio display

---

## 🛠️ Tech Stack

### 🎨 Frontend
- React 19
- React Router DOM
- Socket.IO Client
- Tailwind CSS
- React Hot Toast
- Context API

### ⚙️ Backend
- Node.js
- Express
- Socket.IO
- MongoDB + Mongoose
- Cloudinary
- JWT Authentication
- Bcrypt

---

## 📦 Installation

### ✅ Prerequisites
- Node.js (v18+)
- MongoDB Database
- Cloudinary Account

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🖥️ Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/chat-app.git
cd chat-app/backend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 💻 Frontend Setup

```bash
cd ../frontend

npm install

# Create environment file
echo "VITE_SOCKET_URL=http://localhost:5000" > .env
echo "VITE_API_URL=http://localhost:5000/api" >> .env

npm run dev
```

---

## 🏗️ Project Structure

```
backend/
├── controllers/
├── lib/
│   ├── db.js
│   ├── cloudinary.js
│   └── socket.js
├── middleware/
├── models/
├── routes/
└── server.js

frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── lib/
│   └── pages/
└── index.html
```

---

## 🔌 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### 💬 Messages
- `GET /api/messages/last-messages`
- `GET /api/messages/:userId`
- `POST /api/messages/send/:userId`
- `DELETE /api/messages/delete/:messageId`
- `GET /api/messages/mark/:messageId`

---

## 🎨 Features in Detail

### ⚡ Real-Time Communication
- Instant messaging with Socket.IO
- Online/offline updates
- Read receipts
- Typing indicators (coming soon)

### 🖼️ Image Sharing
- Upload images (up to 5MB)
- Cloudinary storage
- Preview before sending
- Fullscreen image modal
- Download images

### 🎨 UI Features
- 6 Color themes
- Smooth animations
- Loading skeletons
- Toast notifications
- Message copy & delete

### 📱 Mobile Features
- Touch-friendly UI
- Mobile-optimized sidebar
- Bottom sheet options
- Pull to refresh (coming soon)

---

## 🚀 Deployment

### Deploy Backend (Render / Azure / etc.)
- Create new Web Service
- Connect GitHub repo
- Set Environment Variables
- Build command: `npm install`
- Start command: `npm start`

### Deploy Frontend (Vercel)

```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch  
   `git checkout -b feature/AmazingFeature`
3. Commit changes  
   `git commit -m 'Add AmazingFeature'`
4. Push to branch  
   `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📝 License

Licensed under the MIT License.

---

## 🙏 Acknowledgments

- Socket.IO
- Tailwind CSS
- Cloudinary
- React Hot Toast

---

## 📧 Contact

Your Name  
GitHub: [https://github.com/IbrahimAwiby ]
Email: ibrabasm4456@gmail.com  

Project Link: [https://github.com/IbrahimAwiby/chat-app]

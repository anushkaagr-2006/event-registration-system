# 🎉 Event Registration System  

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)  
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)  
![Express](https://img.shields.io/badge/Framework-Express-000000?logo=express&logoColor=white)  
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)  
![Render](https://img.shields.io/badge/Deployed%20On-Render-46E3B7?logo=render&logoColor=white)  

---

## 📌 Project Overview  
The **Event Registration System** is a full-stack web application designed to:  
- Allow participants to **register** for an event seamlessly.  
- Generate **QR codes** for each registration.  
- Enable event staff/admins to **scan QR codes** for check-in.  
- Provide an **Admin Dashboard** with real-time stats & downloadable reports.  

---

## 🚀 Features  

✅ User registration with unique Registration ID  
✅ QR Code generation & scanning for check-in  
✅ Real-time attendance status (Present / Absent)  
✅ Admin authentication & dashboard  
✅ Export registrations & attendance data to Excel  
✅ Fully responsive frontend built with React  
✅ REST API backend with Node.js + Express  
✅ MongoDB Atlas database integration  
✅ Deployed on **Render**  

---

## 🛠️ Tech Stack  

- **Frontend:** React, React Router, Axios, Recharts, HTML5-QRCode  
- **Backend:** Node.js, Express, JWT Authentication  
- **Database:** MongoDB Atlas  
- **Deployment:** Render  
- **Others:** Excel4Node, QRCode.react  

---

## 📂 Project Structure  

event-registration-system/
│
├── backend/ # Express + MongoDB API
│ ├── routes/ # API routes
│ ├── models/ # Database schemas
│ ├── config/ # DB connection
│ └── server.js # Entry point
│
├── frontend/ # React app
│ ├── src/ # Components, Pages, Utils
│ └── package.json
│
└── README.md

---

## 🔑 Admin Login  

- **Password:** `admin123` (stored in `.env`)  
- Once logged in, admins can:  
  - View all registrations  
  - Track attendance  
  - Manually update check-in status  
  - Export data as Excel  

---

## 📦 Setup & Installation  

1. **Clone the repository**  
```bash
git clone https://github.com/anushkaagr-2006/event-registration-system.git
cd event-registration-system

2. **Backend Setup**
```bash
cd backend
npm install
npm run dev

3. **Frontend Setup**
```bash
cd frontend
npm install
npm start

4. **Environment Variables (.env)**
```bash
MONGO_URI=your_mongo_connection_string
PORT=5000
JWT_SECRET=your_secret_key
ADMIN_PASSWORD=admin123

🌐 Live Demo

🔗 https://event-registration-system1.onrender.com
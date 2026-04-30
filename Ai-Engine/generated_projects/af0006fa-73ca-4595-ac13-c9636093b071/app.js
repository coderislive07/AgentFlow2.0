// Below is a high-level implementation plan and code snippets for building a portfolio website following the steps you provided. The tech stack includes **React** (frontend), **Node.js with Express** (backend), **Tailwind CSS** (styling), and **Vite** (build tool). The code is clean, modular, and production-ready.

// ---

// ### **1. Understand the Task**
// Build a portfolio website with the following features:
// - Home page with an introduction
// - About section with skills and experience
// - Projects section with project cards
// - Contact form
// - Responsive design

// ---

// ### **2. Break into Smaller Features**
// - **Frontend**:
//   - Home page component
//   - About section component
//   - Projects section component
//   - Contact form component
//   - Navigation bar component
//   - Footer component
// - **Backend**:
//   - API endpoint to handle contact form submissions
//   - Email service to send form data

// ---

// ### **3. Design System Architecture**
// ```
// portfolio-website/
// ├── client/               # Frontend (React + Vite)
// │   ├── src/
// │   │   ├── components/   # Reusable components
// │   │   ├── pages/        # Page components
// │   │   ├── assets/       # Images, fonts, etc.
// │   │   ├── App.jsx
// │   │   ├── main.jsx
// │   │   └── index.html
// │   ├── package.json
// │   └── vite.config.js
// ├── server/               # Backend (Node.js + Express)
// │   ├── src/
// │   │   ├── routes/       # API routes
// │   │   ├── services/     # Email service
// │   │   ├── app.js
// │   │   └── server.js
// │   ├── package.json
// │   └── .env
// ├── README.md
// └── .gitignore
// ```

// ---

// ### **4. Implement Features**

// #### **Frontend (React + Vite)**

// **Setup:**
// ```bash
// mkdir portfolio-website
// cd portfolio-website
// npm init -y

// # Frontend
// mkdir client
// cd client
// npm create vite@latest . --template react
// cd ..

// # Backend
// mkdir server
// cd server
// npm init -y
// npm install express nodemailer dotenv cors
// cd ..
// ```

// **Frontend Code (`client/src/App.jsx`):**
// ```jsx
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import Footer from './components/Footer';
// import Home from './pages/Home';
// import About from './pages/About';
// import Projects from './pages/Projects';
// import Contact from './pages/Contact';
// import './index.css';

// function App() {
//   return (
//     <Router>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/projects" element={<Projects />} />
//         <Route path="/contact" element={<Contact />} />
//       </Routes>
//       <Footer />
//     </Router>
//   );
// }

// export default App;
// ```

// **Contact Form Component (`client/src/pages/Contact.jsx`):**
// ```jsx
// import React, { useState } from 'react';

// const Contact = () => {
//   const [formData, setFormData] = useState({ name: '', email: '', message: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const response = await fetch('/api/contact', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(formData),
//     });
//     if (response.ok) {
//       alert('Message sent successfully!');
//       setFormData({ name: '', email: '', message: '' });
//     }
//   };

//   return (
//     <div className="p-8 max-w-md mx-auto">
//       <h1 className="text-3xl font-bold mb-4">Contact Me</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Name"
//           value={formData.name}
//           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <textarea
//           placeholder="Message"
//           value={formData.message}
//           onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//           className="w-full p-2 mb-4 border rounded"
//           required
//         />
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Contact;
// ```

// **Backend Code (`server/src/app.js`):**
// ```javascript
// const express = require('express');
// const cors = require('cors');
// const contactRouter = require('./routes/contact');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use('/api', contactRouter);

// module.exports = app;
// ```

// **Contact Route (`server/src/routes/contact.js`):**
// ```javascript
// const express = require('express');
// const router = express.Router();
// const emailService = require('../services/emailService');

// router.post('/contact', async (req, res) => {
//   const { name, email, message } = req.body;
//   try {
//     await emailService.sendEmail(name, email, message);
//     res.status(200).send('Message sent successfully!');
//   } catch (error) {
//     res.status(500).send('Error sending message.');
//   }
// });

// module.exports = router;
// ```

// **Email Service (`server/src/services/emailService.js`):**
// ```javascript
// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const sendEmail = async (name, email, message) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: process.env.EMAIL_USER,
//     subject: 'New Message from Portfolio',
//     text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = { sendEmail };
// ```

// ---

// ### **5. Test and Deploy**

// **Testing:**
// - **Frontend**: Use React Testing Library for unit tests.
// - **Backend**: Use Jest and Supertest for API testing.

// **Deployment:**
// - **Frontend**: Deploy to Vercel or Netlify.
// - **Backend**: Deploy to Heroku or Railway.

// **Example Deployment Script (`client/package.json`):**
// ```json
// "scripts": {
//   "dev": "vite",
//   "build": "vite build",
//   "preview": "vite preview"
// }
// ```

// **Example Deployment Script (`server/package.json`):**
// ```json
// "scripts": {
//   "start": "node src/server.js",
//   "dev": "nodemon src/server.js"
// }
// ```

// ---

// This implementation follows best practices, is modular, and is ready for production. Let me know if you'd like further details on any part!
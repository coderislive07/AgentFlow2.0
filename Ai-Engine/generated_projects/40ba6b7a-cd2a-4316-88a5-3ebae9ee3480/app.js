Below is a high-level, production-ready implementation of a portfolio website using modern tools, libraries, and best practices. The codebase is structured, modular, and follows industry standards.

---

### **Tech Stack**
- **Frontend**: React.js (with Vite), Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (optional, for contact form submissions)
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel (Frontend), Render or Railway (Backend)
- **Version Control**: Git (GitHub/GitLab)

---

### **Project Structure**
```
portfolio-website/
├── client/                  # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page-specific components
│   │   ├── assets/          # Images, fonts, etc.
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .eslintrc.json       # Linting config
│   ├── vite.config.js       # Vite config
│   └── package.json
├── server/                  # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB models (if used)
│   │   ├── utils/           # Utility functions
│   │   ├── app.js
│   │   └── server.js
│   ├── .env                 # Environment variables
│   ├── .gitignore
│   └── package.json
├── README.md
└── LICENSE
```

---

### **Clean Production-Ready Code**

#### **Frontend (React + Vite + Tailwind CSS)**

**`client/src/App.jsx`**
```jsx
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
```

**`client/src/components/Navbar.jsx`**
```jsx
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          My Portfolio
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/about" className="text-gray-600 hover:text-gray-800">
              About
            </Link>
          </li>
          <li>
            <Link to="/projects" className="text-gray-600 hover:text-gray-800">
              Projects
            </Link>
          </li>
          <li>
            <Link to="/contact" className="text-gray-600 hover:text-gray-800">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
```

**`client/src/pages/Home.jsx`**
```jsx
const Home = () => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to My Portfolio</h1>
      <p className="text-lg text-center text-gray-700">
        I'm a full-stack developer passionate about building scalable and user-friendly applications.
      </p>
    </div>
  );
};

export default Home;
```

---

#### **Backend (Node.js + Express)**

**`server/src/app.js`**
```javascript
const express = require('express');
const cors = require('cors');
const contactRouter = require('./routes/contactRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contact', contactRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
});

module.exports = app;
```

**`server/src/routes/contactRoutes.js`**
```javascript
const express = require('express');
const { submitContactForm } = require('../controllers/contactController');

const router = express.Router();

router.post('/submit', submitContactForm);

module.exports = router;
```

**`server/src/controllers/contactController.js`**
```javascript
const Contact = require('../models/Contact');

exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = new Contact({ name, email, message });
    await contact.save();
    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit form' });
  }
};
```

---

#### **Testing (Jest + React Testing Library)**

**`client/src/components/Navbar.test.jsx`**
```jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

test('renders Navbar with correct links', () => {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
  expect(screen.getByText('My Portfolio')).toBeInTheDocument();
  expect(screen.getByText('About')).toBeInTheDocument();
  expect(screen.getByText('Projects')).toBeInTheDocument();
  expect(screen.getByText('Contact')).toBeInTheDocument();
});
```

---

#### **Deployment**

1. **Frontend**:
   - Build the React app: `npm run build`
   - Deploy to Vercel using the `vercel` CLI.

2. **Backend**:
   - Deploy to Render or Railway by connecting to the GitHub repository.

---

This codebase is modular, scalable, and follows best practices for production-ready applications. It includes proper error handling, testing, and deployment strategies.
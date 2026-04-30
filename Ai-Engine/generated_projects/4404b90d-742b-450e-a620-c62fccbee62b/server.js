const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

app.post('/send-email', (req, res) => {
  const mailOptions = {
    from: req.body.email,
    to: 'your-email@gmail.com',
    subject: 'New Message from Portfolio',
    text: `${req.body.name}: ${req.body.message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json({ success: false });
    } else {
      res.json({ success: true });
    }
  });
});

app.use(express.static('dist'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
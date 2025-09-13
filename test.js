require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("MongoDB Connection Error:", err.message));

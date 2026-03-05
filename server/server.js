require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// Use Render's dynamic PORT
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
require("./utils/socket").init(server);
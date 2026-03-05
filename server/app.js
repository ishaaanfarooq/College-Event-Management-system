const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./utils/swagger");

// Critical Environment Validation
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
    console.error("FATAL ERROR: JWT_SECRET or MONGO_URI is not defined.");
    process.exit(1);
}

const app = express();

// Middleware
app.use(helmet()); // Security Headers
app.use(morgan("dev")); // Professional Logging
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Root test route
app.get("/", (req, res) => {
    res.send("College EMS Backend Running 🚀");
});

module.exports = app;


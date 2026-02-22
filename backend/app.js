import express from 'express';
import pool from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import 'dotenv/config';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/patientRoutes.js';
import healthRoutes from './routes/healthRoutes.js';

const app = express();

// Middleware
app.use(cors({
  origin: `${process.env.CLIENT_URL}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'withCredentials'],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Test database connection
pool.getConnection()
  .then((connection) => {
    console.log("✅ Connected to MySQL/TiDB Database");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', userRoutes);
app.use('/api/health', healthRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

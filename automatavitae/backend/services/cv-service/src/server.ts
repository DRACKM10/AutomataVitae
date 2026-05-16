import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cvRoutes from './routes/cv.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors()); // Habilitar CORS para el frontend
app.use(express.json());

// Montar rutas del microservicio de CVs
app.use('/api/v1/cvs', cvRoutes);

app.listen(PORT, () => {
  console.log(`🚀 CV-Service corriendo en http://localhost:${PORT}`);
});

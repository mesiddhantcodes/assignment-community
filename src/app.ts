import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.routes';
import communityRoutes from './routes/community.routes';
// import memberRoutes from './routes/member.routes';
import roleRoutes from './routes/role.routes'; 
import { connectToDatabase } from './utils/db'
const app = express();
const workerId = 1; 

// Middleware
app.use(bodyParser.json());

connectToDatabase()

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/community', communityRoutes);
// app.use('/v1/member', memberRoutes);
app.use('/v1/role', roleRoutes); 

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import todoRoute from './routes/todos';
import authRoute from './routes/auth';
import categoryRoute from './routes/categories';
import reminderRoute from './routes/reminders';
import userRoute from './routes/user';
import 'reflect-metadata';
import getConnection from './config/connection';
import { specs } from './swagger/swagger';
import { authMiddleware } from './middlewares/authMiddleware';
require('dotenv').config({ path: __dirname + '/./../../.env' });
import cors from 'cors';
import createTables from './config/createTable';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoute);
app.use(authMiddleware);
app.use('/api/todo', todoRoute);
app.use('/api/category', categoryRoute);
app.use('/api/reminder', reminderRoute);
app.use('/api/user', userRoute);

async function startServer() {
  try {
    await getConnection();
    console.log('MariaDB 연결 성공!');
    await createTables();
    app.listen(PORT, () => {
      console.log(`Server listening on port: ${PORT}`);
    });
  } catch (err) {
    console.error('MariaDB 연결 실패:', err);
    process.exit(1);
  }
}

startServer();

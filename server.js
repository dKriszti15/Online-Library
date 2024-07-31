import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import path from 'path';
import fs from 'fs/promises';
import mysql from 'mysql2/promise.js';
import { serverinfo } from './serverinfo.js';
import altalanos from './routers/altalanos.js';
import admin from './routers/admin.js';
import szemelyes from './routers/szemelyes.js';

const staticDir = path.join(process.cwd(), 'public');

const app = express();

const connection = await mysql.createConnection({
  database: 'webprog',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Kecske111',
  multipleStatements: 'true',
});

// script.sql futtatasa
const script = await fs.readFile('script.sql', 'utf8');
await connection.query(script);

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

app.use(
  session({
    secret: '142e6ecf42884f03',
    resave: false,
    saveUninitialized: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

app.use((req, res, next) => {
  req.serverInfo = {
    port: serverinfo.port,
  };
  next();
});

app.use(express.static(staticDir));

app.use('/', altalanos);

app.use('/', admin);

app.use('/', szemelyes);

const server = app.listen(serverinfo, () => {
  const { port } = server.address();
  let host = server.address().address;
  if (host === '::') {
    host = 'localhost';
  }
  console.log(`Fut a szerver a ${host}:${port} cimen!`);
});

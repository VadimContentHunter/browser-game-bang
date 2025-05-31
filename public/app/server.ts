import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import session from 'express-session';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { WebSocketServer, WebSocket } from 'ws';

import path from 'path';
import http from 'http';
import net from 'net';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import Stream from 'stream';

const __filename = fileURLToPath(import.meta.url); // полный путь к файлу /var/www/browser-game-bang/dist/server.js
const __dirname = path.dirname(__filename); // путь к папке файла /var/www/browser-game-bang/dist
const __projectRoot = path.resolve(__dirname, '../app'); // /var/www/browser-game-bang/app
const sessionParser = session({
    saveUninitialized: false,
    secret: 'my secret_test',
    resave: false,
    cookie: { secure: false },
});

const app = express();

app.use(morgan('dev'));
app.use(sessionParser);
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    if (!req.session.username) {
        req.session.username = faker.internet.username();
        req.session.save((err) => {
            if (err) {
                console.error('Ошибка сохранения сессии:', err);
                res.status(500).send('Ошибка сессии');
                return;
            }
            console.log('Создан новый username в сессии:', req.session.username);
        });
    } else {
        console.log('Сессия пользователя:', req.session.username);
    }

    res.sendFile(path.join(__projectRoot, 'main.html'));
});

// Роут для главной страницы
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__projectRoot, 'main.html'));
});

// Запуск сервера
const PORT = 9003;
const server = app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Создание WebSocket сервера, привязанного к существующему серверу
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
    // Извлечь сессию, которая была прикреплена в upgrade (см. ниже)
    const session = req.session;
    if (!session) {
        ws.close(1008, 'Нет сессии');
        return;
    }

    console.log('WS: Новый пользователь:', session.username);

    ws.send(`Привет, ${session.username}! Добро пожаловать в WebSocket.`);

    ws.on('message', (message) => {
        console.log(`Получено сообщение от ${session.username}: ${message}`);
        ws.send(`Вы отправили: ${message}`);
    });
});

server.on('upgrade', (req: http.IncomingMessage, socket: Stream.Duplex, head: Buffer<ArrayBufferLike>) => {
    // Парсим куки из заголовков
    const cookies = cookie.parse(req.headers.cookie || '');
    const sidCookie = cookies['connect.sid'];

    if (!sidCookie) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
    }

    // Сессию нужно достать из sessionParser
    // sessionParser использует internalStore, его можно получить через callback
    sessionParser(req as Request, {} as Response, () => {
        if (!req.session) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    });
});

import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import http from 'http';
import net from 'net';
import { fileURLToPath } from 'url';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url); // полный путь к файлу /var/www/browser-game-bang/dist/server.js
const __dirname = path.dirname(__filename); // путь к папке файла /var/www/browser-game-bang/dist
const __projectRoot = path.resolve(__dirname, '../app'); // /var/www/browser-game-bang/app
const sessionParser = session({
    saveUninitialized: false,
    secret: 'мой_секрет',
    resave: false,
    cookie: { secure: false },
});

const app = express();
app.use(sessionParser);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    if (!req.session.username) {
        req.session.username = `Игрок_${uuidv4()}`;
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
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // const cookies = cookieParser.signedCookies(req.headers.cookie, 'your-secret-key');
    // const sessionId = cookies['connect.sid'];

    // if (!session.username) {
    //     session.username = `Игрок_${uuidv4()}`; // создаём username при отсутствии
    //     session.save((err) => {
    //         if (err) console.error('Ошибка сохранения сессии:', err);
    //     });
    // }

    // console.log('Сессия пользователя:', session.username);

    ws.on('message', (message) => {
        let text: string;

        if (typeof message === 'string') {
            text = message; // Уже строка
        } else if (message instanceof Buffer) {
            text = message.toString(); // Без аргумента
        } else {
            console.warn('Неизвестный тип сообщения');
            return;
        }

        console.log('Получено сообщение:', text);
    });

    ws.send('Добро пожаловать в WebSocket-сервер!');
});

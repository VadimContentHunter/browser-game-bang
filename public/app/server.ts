import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { WebSocketServer, WebSocket } from 'ws'; // Импортируем WebSocketServer и WebSocket из ws
import path from 'path';
import { fileURLToPath } from 'url';
import { IncomingMessage } from 'http';

import './types/express-session-augment.js';

const __filename = fileURLToPath(import.meta.url); // полный путь к файлу /var/www/browser-game-bang/dist/server.js
const __dirname = path.dirname(__filename); // путь к папке файла /var/www/browser-game-bang/dist
const __projectRoot = path.resolve(__dirname, '../app'); // /var/www/browser-game-bang/app

// console.log(`filename ${__filename}`);
// console.log(`dirname ${__dirname}`);
// console.log(`projectRoot ${__projectRoot}`);

const app = express();

app.use(
    session({
        secret: 'мой_секрет', // для подписи cookie
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }, // для разработки без HTTPS
    })
);

// Парсинг входящих данных
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Роут для главной страницы
app.get('/', (req, res) => {
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
    console.log('Новый WebSocket клиент подключился');

    // Если сессия существует, извлекаем данные сессии
    const session = req.session;
    if (session) {
        console.log('Сессия:', session);
    }

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

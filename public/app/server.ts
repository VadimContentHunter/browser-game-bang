import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { WebSocketServer, WebSocket } from 'ws'; // Импортируем WebSocketServer и WebSocket из ws
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { IncomingMessage } from 'http';

const __filename = fileURLToPath(import.meta.url); // <-- добавил
const __dirname = dirname(__filename); // <-- добавил

const app = express();

// Настройка express-session
// const sessionParser = session({
//     secret: 'your_secret_key', // Замените на свой секрет
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         maxAge: 24 * 60 * 60 * 1000, // 1 день
//     },
// });

// Указываем типы для req, res и next
// app.use((req: Request, res: Response, next: NextFunction) => {
//     sessionParser(req, res, next);
// });

// Обслуживаем статические файлы из папки public
// app.use(express.static(path.join(__dirname, 'public')));

// Роут для главной страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// Запуск сервера
const PORT = 9003;
const server = app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

// Создание WebSocket сервера, привязанного к существующему серверу
const wss = new WebSocketServer({ server });

// Расширяем тип для запроса
// interface SessionRequest extends IncomingMessage {
//     session?: session.Session & Partial<session.SessionData>;
// }

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    // Если сессия существует, извлекаем данные сессии
    // const session = req.session;

    console.log('Новый WebSocket клиент подключился');
    // if (session) {
    //     console.log('Сессия:', session);
    // }

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

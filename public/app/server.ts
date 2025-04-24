import express, { Request, Response } from 'express';

const app = express();
const port = 9003;

// Маршрут по умолчанию
app.get('/', (req: Request, res: Response) => {
    const message: string = 'hello, eslint';
    res.send('Hello, world!');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

import session from 'express-session';

declare module 'http' {
    interface IncomingMessage {
        session: session.Session & {
            username?: string; // если ты хочешь хранить имя пользователя, можешь тут указать
        };
    }
}

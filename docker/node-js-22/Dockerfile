# Используем версию Node.js 22
FROM node:22

# Устанавливаем рабочую директорию в контейнере в /var/www/browser-game-bang
WORKDIR /var/www/browser-game-bang

# Копируем файл package.json в рабочую директорию
COPY ./public/package.json /var/www/browser-game-bang/

# Устанавливаем зависимости
RUN npm install

# Копируем весь контент из папки public в рабочую директорию
COPY ./public /var/www/browser-game-bang/

# Открываем порты
EXPOSE 9003

# Устанавливаем команду для запуска приложения
CMD ["npm", "start"]

# Проект Chat

Этот файл README содержит информацию о том, как запустить и настроить проект Chat.

## Установка

1. Клонируйте репозиторий:
    ```bash
    git clone https://github.com/fetyre/slmax-nest-testovoe-zadanie.git
    ```
2. Перейдите в директорию проекта:
    ```bash
    cd chat
    ```
3. Установите зависимости:
    ```bash
    npm install
    ```

## Настройка

1. Создайте файл `.env` в корневой директории проекта и добавьте необходимые переменные окружения. Пример:

    ```plaintext
    DATABASE_URL="..."
    ```
    
    Замените `...` на URL вашей базы данных.

2. Настройте Docker Compose, заменив значения переменных окружения в файле `docker-compose.yml`. Вам нужно будет заменить следующие значения на свои собственные:

    - `POSTGRES_USER`
    - `POSTGRES_PASSWORD`
    - `POSTGRES_DB`
    - `DATABASE_URL`

## Запуск

1. Запустите проект:

    ```bash
    docker-compose up -d --build 
    docker exec -it zadanie npx prisma generate 
    docker exec -it zadanie npm run prisma migrate dev
    ```

После выполнения этих шагов, ваш проект готов к использованию! 😊

Chat
Этот файл README содержит информацию о том, как запустить и настроить проект Chat.

Установка
Клонируйте репозиторий:

bash
git clone https://github.com/fetyre/slmax-nest-testovoe-zadanie.git
Перейдите в директорию проекта:

bash
cd chat
Установите зависимости:

bash
npm install
Настройка
Создайте файл .env в корневой директории проекта и добавьте необходимые переменные окружения. Пример:

plaintext
DATABASE_URL="..."
APP_ID="..."
PORT=...
ISSUER="..."
DOMAIN="..."
JWT_REFRESH_PUBLIC_KEY='...'
JWT_REFRESH_PRIVATE_KEY='...'
JWT_REFRESH_TIME=604800
JWT_ACCESS_TIME=604800
JWT_ACCESS_PUBLIC_KEY='...'
JWT_ACCESS_PRIVATE_KEY='...'
Замените многоточия (...) в переменных JWT_REFRESH_PUBLIC_KEY, JWT_REFRESH_PRIVATE_KEY, JWT_ACCESS_PUBLIC_KEY и JWT_ACCESS_PRIVATE_KEY на соответствующие ключи, которые вы предоставили в предыдущем сообщении.

Запуск
Запустите проект:

bash
npm start

# QA Backend (NestJS + Prisma)

Учебный backend-проект с типизированным CRUD для вопросов и ответов, JWT-аутентификацией и ролевой моделью (USER/ADMIN).
Проект рассчитан на разработку в Windows 11 + WSL (hot reload в WSL) и инфраструктуру в Docker (PostgreSQL + Adminer).

## Возможности

- Регистрация и авторизация по JWT (access token).
- Роли пользователей: USER и ADMIN.
- CRUD для вопросов (Questions) и ответов (Answers).
- Лучший ответ: у каждого вопроса может быть не более одного ответа с `isBest = true`.
- Получение списка вопросов с пагинацией и опциональной подгрузкой ответов:
    - `page`, `limit`
    - `includeAnswers`
    - `answersLimit` (ограничение количества ответов на вопрос)
- Swagger UI + OpenAPI спецификация.
- Сидеры для заполнения БД тестовыми данными: users, questions, answers.
- Postman-коллекция для тестирования API.

## Технологии и зачем они здесь

- **NestJS** — фреймворк для построения модульного server-side приложения на Node.js.
- **Prisma ORM** — работа с БД через Prisma Client, миграции Prisma.
- **PostgreSQL** — основная база данных проекта.
- **JWT (Passport + @nestjs/jwt)** — аутентификация через access token.
- **RBAC (roles/guards)** — доступ к эндпоинтам в зависимости от роли (USER/ADMIN).
- **Zod + nestjs-zod** — валидация входных данных и типизированные DTO на основе схем.
- **Swagger (@nestjs/swagger)** — интерактивная документация и OpenAPI спецификация.
- **Adminer** — простой web-интерфейс для просмотра данных в PostgreSQL.
- **Faker** — генерация моковых данных в сидерах.

## Требования

- Node.js (рекомендуется LTS).
- Docker + Docker Compose.
- WSL (если вы на Windows и хотите hot reload).
- npm (или pnpm/yarn — ниже команды показаны для npm).

## Быстрый старт с нуля

Ниже сценарий для чистого клона репозитория.

### 1) Установка зависимостей

```bash
npm ci
# или
npm install
```

### 2) Переменные окружения

Проект использует `DATABASE_URL` и секреты JWT.

Пример минимального `.env` (значения подставьте под вашу конфигурацию):

```env
DATABASE_URL="postgresql://app:app@postgres:5432/app?schema=public"

JWT_ACCESS_SECRET="change-me"
JWT_ACCESS_EXPIRES_IN="7d"
```

Примечание:

- Хост `postgres` удобен, если приложение запускается в окружении, где этот хост резолвится (Docker network / ваш сетап).
- Если вы запускаете API локально и `postgres` не резолвится, используйте `localhost`.

### 3) Поднять инфраструктуру (PostgreSQL + Adminer) в Docker

```bash
docker compose up -d
```

Проверьте, что контейнеры поднялись:

```bash
docker compose ps
```

### 4) Применить миграции Prisma

```bash
npx prisma migrate dev
```

### 5) Заполнить БД тестовыми данными (сидеры)

Рекомендуемый порядок:

```bash
npm run seed:users
npm run seed:questions
npm run seed:answers
```

### 6) Запустить API (hot reload)

```bash
npm run start:dev
```

API поднимется (по умолчанию) на `http://localhost:3000`.

## Документация API (Swagger / OpenAPI)

### Swagger UI

- `http://localhost:3000/api/docs`

### OpenAPI JSON

- `http://localhost:3000/api/docs-json`

### OpenAPI YAML

Если в проекте включён YAML endpoint, то:

- `http://localhost:3000/api/docs-yaml`

Если YAML endpoint отключён, YAML можно получить конвертацией из JSON любым инструментом.

## Adminer

Адрес:

- `http://localhost:8080/`

Параметры подключения (значения по умолчанию из `docker-compose.yml`):

- System: PostgreSQL
- Server: `postgres`
- Username: `app`
- Password: `app`
- Database: `app`

### Тема Adminer

В проекте подключена кастомная тема через файл `adminer.theme.css` в корне репозитория. Он монтируется в контейнер Adminer как `adminer.css` (см.
`docker-compose.yml`), поэтому Adminer автоматически подхватывает стили при запуске.

Если вы переименуете файл темы, обновите путь в `docker-compose.yml` в секции `adminer.volumes`.

Чтобы применить изменения в теме, пересоздайте контейнер Adminer:

```bash
docker compose up -d --force-recreate adminer
```

Готовые темы можно взять здесь:

- https://github.com/vrana/adminer/tree/master/designs

## Postman

В корне репозитория лежит коллекция:

- `postman.collection.json`

Импортируйте её в Postman и запускайте запросы по сценариям внутри папок коллекции.
Для защищённых эндпоинтов используйте токены, полученные через `/auth/login`.

## Команды проекта

Основные команды:

- `npm run start:dev` — запуск в режиме watch (hot reload).
- `npm run build` — сборка.
- `npm run start:prod` — запуск собранного приложения.
- `npm run seed:users` — сидер пользователей (3 USER + 1 ADMIN).
- `npm run seed:questions` — сидер вопросов (авторы берутся из users).
- `npm run seed:answers` — сидер ответов (0..10 ответов на вопрос, 0 или 1 лучший ответ).

В `package.json` есть команды для тестов, но они не являются частью текущего учебного этапа и могут быть проигнорированы.

## Права доступа (ролевая модель)

Роли:

- `USER`
- `ADMIN`

Сейчас доступ к части эндпоинтов ограничен ролями (RBAC). Если при тестировании получаете `403`, проверьте:

- каким пользователем вы залогинились
- какой токен используется в запросе

## Частые проблемы

### Ошибка Foreign Key при создании вопроса/ответа

Обычно означает, что `authorId` (из токена) не существует в таблице `users`.
Решение:

- запустить `npm run seed:users`
- заново залогиниться и получить новый токен (старые токены после пересоздания БД становятся невалидными логически)

### Порты заняты

Если порт занят, измените порты в `docker-compose.yml` или остановите процесс, который его занимает.

TODO:

Автоматизировать формирование и получение строк типа "GET /api/questions/:questionId/answers" вместе с именами параметров в тестах.

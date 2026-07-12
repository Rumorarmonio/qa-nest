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
- Выделенная тестовая инфраструктура для unit, e2e и integration тестов.
- Отдельная тестовая база данных для integration/e2e-тестов через `.env.test`.

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
- **Jest + Supertest** — тестирование API и модулей приложения.

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

Для integration и e2e-тестов используется отдельный `.env.test`, в котором `DATABASE_URL` должен указывать на отдельную test DB, например `app_test`.
Тесты запускаются последовательно, поэтому отдельные schema на worker не нужны.

Примечание:

- Хост `postgres` удобен, если приложение запускается в окружении, где этот хост резолвится (Docker network / ваш сетап).
- Если вы запускаете API локально и `postgres` не резолвится, используйте `localhost`.

### 3) Поднять инфраструктуру (PostgreSQL + test PostgreSQL + Adminer) в Docker

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

### Тесты

В проекте уже выделены отдельные команды для e2e и integration тестов:

- `npm run test:e2e`
- `npm run test:e2e:verbose`
- `npm run test:e2e:watch`
- `npm run test:integration`
- `npm run test:integration:verbose`

Для полного сброса test DB можно использовать:

- `npm run db:test:reset`

Команда сбрасывает test DB, заново накатывает миграции и затем сидит базовых пользователей, которых используют e2e helper-ы для логина.

Также в проекте есть unit-тесты для чистых тестовых утилит и route infrastructure. Они разложены в отдельную директорию `test/unit`.

## Тестирование

В проекте предусмотрено несколько уровней тестирования, и тестовая инфраструктура была постепенно приведена к более структурированному виду.

### Какие виды тестов есть

- **E2E / API tests** — проверяют HTTP-эндпоинты целиком: роутинг, guards, DTO/валидацию, сервисы, Prisma и ответы API.
- **Integration tests** — проверяют сервисы и бизнес-логику на реальной PostgreSQL test DB без HTTP-слоя.
- **Unit tests** — изолированно проверяют чистые функции и тестовую инфраструктуру (`testRoute`, route utils и т.д.).

### Рекомендуемая структура тестов

```text
test/
  e2e/
    api/
      api-route.types.ts
      api-route.utils.ts
      api-routes.answers.ts
      api-routes.auth.ts
      api-routes.health.ts
      api-routes.questions.ts
      api-routes.ts
      test-route.ts

    helpers/
      answers.helper.ts
      auth.helper.ts
      questions.helper.ts
      setup-e2e.ts

    auth.spec.ts
    answers.spec.ts
    questions.spec.ts
    health.spec.ts

  integration/
    helpers/
      integration-data.helper.ts
    *.spec.ts

  setup-env.ts

  unit/
    e2e/
      test-route.spec.ts
      api/
        api-route.utils.spec.ts
```

Смысл такой:

- `test/e2e` — API end-to-end тесты.
- `test/integration` — integration-тесты сервисов на отдельной test DB.
- `test/unit` — unit-тесты для чистых утилит и тестовой инфраструктуры.
- `test/e2e/api` — тестовая инфраструктура для API-роутов и helper-функции для описания тестов.
- `test/e2e/helpers` — вспомогательные функции для e2e-сценариев (логин, создание сущностей и т.д.).

### Почему маршруты тестов вынесены в отдельную инфраструктуру

Изначально тесты содержали ручные описания вроде:

```ts
it('GET /api/questions/:questionId/answers should return answers list', async () => {
})
```

Это приводило к дублированию:

- реальный URL строился через `apiRoutes`
- строка с названием теста жила отдельно

В результате при изменении маршрута приходилось обновлять и route builder, и текст названия теста.

Чтобы этого избежать, тестовые API-маршруты были оформлены как отдельные **route objects**.

### Новый формат маршрутов для тестов

Для каждого endpoint action хранится не только путь, но и его метаданные:

- `method`
- `pattern`
- `path` — для статических роутов
- `build(...)` — для динамических роутов

Пример статического маршрута:

```ts
({
  method: 'POST',
  pattern: '/api/auth/login',
  path: '/api/auth/login',
})
```

Пример динамического маршрута:

```ts
({
  method: 'GET',
  pattern: '/api/questions/:id',
  build: (id: string) => `/api/questions/${id}`,
})
```

Это позволяет использовать один и тот же источник правды:

- для выполнения HTTP-запроса
- для генерации названия теста

### Route DSL для тестов

Для единообразия были добавлены:

- `api-route.types.ts` — типы маршрутов
- `api-route.utils.ts` — утилиты создания маршрутов
- `api-routes.*.ts` — маршруты, разбитые по доменам (`auth`, `questions`, `answers`, `health`)
- `api-routes.ts` — агрегатор всех тестовых маршрутов
- `test-route.ts` — helper для объявления тестов

Также `API_PREFIX_PATH` добавляется централизованно внутри route utils, чтобы не дублировать его в каждом route file.

### Объявление тестов через `testRoute`

Чтобы не писать в каждом тесте вручную название вида `${method} ${pattern} ...`, используется helper:

```ts
testRoute(route, description, testFn)
```

Он:

- автоматически строит название теста из `route.method`, `route.pattern` и описания
- внутри вызывает стандартный `it(...)`

Пример:

```ts
testRoute(questions.getAnswers, 'should return answers list', async () => {
  const response = await request()
    .get(questions.getAnswers.build(questionId))
    .expect(200)

  expect(Array.isArray(response.body)).toBe(true)
})
```

Дополнительно поддерживаются:

- `testRoute.only(...)`
- `testRoute.skip(...)`

### Деструктуризация `apiRoutes` в тестах

Чтобы код был короче и чище, в начале тестовых файлов можно доставать нужные группы маршрутов:

```ts
const { questions, answers } = apiRoutes
```

После этого в тестах используются короткие обращения вроде:

- `questions.getAnswers.build(questionId)`
- `answers.markBest.build(answerId)`
- `auth.login.path`

### Helper-файлы для e2e

В проекте используются отдельные helper-файлы для повторяющихся действий в e2e-тестах, например:

- логин как USER / ADMIN
- создание вопроса
- создание ответа
- обновление сущностей

Эти helper-файлы также используют новый route API (`.path` и `.build(...)`), чтобы весь тестовый слой был единообразным.

### Именование тестовых файлов

Если тесты уже разложены по папкам `test/e2e` и `test/integration`, тип теста можно определять по директории, а не по длинному суффиксу имени файла.

Поэтому допустимы короткие имена:

- `auth.spec.ts`
- `answers.spec.ts`
- `questions.spec.ts`

вместо:

- `auth.e2e-spec.ts`
- `answers.e2e-spec.ts`
- `questions.e2e-spec.ts`

Аналогично для integration-тестов:

- `answers.service.spec.ts`

### Настройка Jest

При такой структуре удобно настраивать Jest не по суффиксам файлов, а по папкам, например через `testMatch`:

- `test/e2e/**/*.spec.ts`
- `test/integration/**/*.spec.ts`

Это обычно удобнее, чем завязываться на `testRegex` с длинными суффиксами.

### Переменные окружения для integration-тестов

Integration- и e2e-тесты используют отдельное окружение и отдельную test DB. Для этого в корне проекта поддерживается файл `.env.test`, а Jest подгружает его через:

```text
test/setup-env.ts
```

Это позволяет запускать тесты изолированно от основной базы разработки.

Аналогично, если e2e-тестам нужен собственный bootstrap/setup, его лучше держать внутри `test/e2e`.

### Общая идея тестовой инфраструктуры

Тестовая инфраструктура проекта устроена так, чтобы:

- уменьшать дублирование
- избегать рассинхрона между реальным роутом и названием теста
- единообразно описывать API endpoint operations
- упрощать поддержку и рефакторинг тестов
- масштабироваться при росте количества эндпоинтов и тестовых сценариев

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

## TODO

- При необходимости добавить поверх `db:test:reset` автоматический seed для тестовых сценариев, где нужен не пустой baseline.
- При необходимости добавить отдельный Jest-конфиг и npm scripts для `test/unit`.
- Держать Jest-конфигурацию синхронизированной с реальной структурой папок (`test/e2e`, `test/integration`, `test/unit`).
- Поддерживать единый стиль объявления API-тестов через route objects и `testRoute(...)`.

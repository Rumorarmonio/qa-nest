# Рабочие заметки проекта

## Проект

QA Backend - NestJS + Prisma backend для Q&A-сценария. В проекте уже есть auth, CRUD для questions и answers, роли USER/ADMIN, сидеры, Swagger, e2e/integration/unit тесты, Adminer и Postman-коллекция как вспомогательный инструмент.

## Цель

Минимальная рабочая версия должна стабильно обслуживать API: регистрация и логин, получение текущего пользователя, работа с вопросами и ответами, авторизация по ролям, корректные статусы ошибок, тесты на ключевые сценарии и готовность к подключению админки.

## Текущее состояние

Сейчас основной API уже есть и покрывает базовый сценарий использования. Auth, questions, answers, Prisma-схема, сидеры, Swagger и тестовая инфраструктура реализованы. AdminJS уже подключён как готовая админка поверх существующего API; маршрут `/admin` должен открывать панель после запуска приложения и доступной Postgres. Для списков и поиска связей добавлен read-only ресурс `users`, чтобы relation search для `questions` и `answers` не падал. Для AdminJS теперь обязательны явные `ADMINJS_COOKIE_PASSWORD` и `ADMINJS_SESSION_SECRET`, а сессии хранятся в Postgres через отдельный session store. В админке включена дефолтная тёмная тема, а переключение dark/light вынесено в toggle рядом с профилем и сохраняется через session-поле `currentAdmin.theme` и отдельный маршрут внутри `/admin`. Коллекция Postman существует, но рассматривается как вспомогательный ручной инструмент, а не как основной источник качества.

## Ключевые решения

Только действительно важные архитектурные договорённости.

- Backend/API приоритетнее frontend и общих контрактов.
- Пользователь может редактировать свои questions и answers.
- Пользователь не получает автоматическое право удалять чужие answers под своим вопросом.
- Best answer должен быть ограничен не только логикой сервиса, но и правилом на уровне PostgreSQL.
- Soft delete и полноценный users API пока откладываются.
- Refresh token flow тоже откладывается на потом.
- Админка нужна как отдельный backoffice-инструмент поверх API, а не как замена Adminer.
- Postman остаётся опциональным и не должен быть обязательным слоем покрытия всех кейсов.

## Что уже сделано

- Реализованы модули auth, questions, answers, users, prisma, health.
- Есть регистрация, логин и `me` по JWT.
- Есть CRUD для вопросов и ответов, включая пагинацию, nested answers и mark-best.
- Для `update` у questions и answers уже зафиксированы ownership rules: редактировать может автор или ADMIN.
- В `UsersService` публичные методы уже читают только публичные поля через `select`, а `validateCredentials` оставляет `passwordHash` только для проверки пароля.
- `registerSchema` в `auth.dto.ts` теперь переиспользует `createUserSchema.omit({ role: true })`, чтобы не дублировать поля name/email/password.
- Тестовые helpers для integration и e2e сведены в фабрики с привязанными `prismaService`/`request`.
- Для e2e есть единый `createE2eHelpers(request)`-слой с namespace-доступом `helpers.auth/questions/answers`.
- Для integration и e2e тестов используется отдельная test DB через `.env.test` и отдельный `postgres-test` сервис в `docker-compose.yml`; тесты запускаются последовательно через `--runInBand`.
- `db:test:reset` теперь сбрасывает test DB, накатывает миграции и сразу сидит базовых пользователей, чтобы e2e helper-ы могли логиниться без ручного шага.
- Для integration есть `setupIntegration(...)`, который берёт на себя lifecycle module/prisma/cleanup и отдаёт `ctx` через getters.
- Для `best answer` уже добавлены проверки на создание ответа с `isBest=true` и на уникальный DB-constraint через прямую Prisma-вставку; в сервисе `AnswersService` уникальная ошибка теперь переводится в `ConflictException`.
- Есть сидеры users, questions и answers.
- Есть Swagger/OpenAPI.
- Есть e2e, integration и unit тестовая инфраструктура.
- Есть Adminer в docker-compose.
- Есть Postman-коллекция для основных сценариев.
- AdminJS подключён как готовая админка поверх существующего API.
- В AdminJS добавлен read-only ресурс `users` для relation search.
- В AdminJS сессии хранятся в Postgres, а секреты cookie/session теперь задаются явно через env.
- В AdminJS включена дефолтная dark theme, а переключение dark/light сделано через toggle и `currentAdmin.theme` в session.

## Текущие проблемы / открытые вопросы

- Нужно поднять Postgres и вручную проверить `/admin` с корректно заданными `ADMINJS_COOKIE_PASSWORD` и `ADMINJS_SESSION_SECRET`, а также переключение dark/light через toggle в шапке админки.
- DB-level constraint для единственного best answer уже есть в initial migration, но при дальнейшем изменении схемы его важно не потерять.

## Следующий шаг

Поднять Postgres и вручную проверить `/admin`, затем решить, нужны ли ещё кастомные admin endpoints. Отдельно проверить, что переключение dark/light через toggle меняет theme в session и переживает reload.

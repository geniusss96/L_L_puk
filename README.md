# Социальная сеть: PageRank Анализ

Проект разработан для анализа "влиятельных" узлов в социальной сети.

## Структура проекта
- `backend/` - Python FastAPI сервер + NetworkX + SQLAlchemy (Neon DB)
- `frontend/` - React (Vite) клиент в корпоративном стиле Profi University
- `academic_report.md` - Отчет по математической модели

## Инструкции по развертыванию
1. **Frontend (Vercel)**
   - Подключите репозиторий в Vercel. 
   - Укажите Framework Preset: `Vite`.
   - Настройте переменную окружения `VITE_API_URL` на URL вашего бэкенда (Render).

2. **Backend (Render.com)**
   - Подключите репозиторий в Render и создайте Web Service.
   - Root Directory: `backend`
   - Команды: сборка и запуск указаны в `render.yaml`.
   - В Dashboard добавьте переменную окружения `DATABASE_URL` от вашего Neon.tech.
   - Скопируйте Deploy Hook URL в Render и добавьте его в GitHub Secrets под именем `RENDER_DEPLOY_HOOK` для CI/CD автоматизации.

3. **Neon.tech (Database)**
   - Создайте проект на Neon.
   - Скопируйте строку подключения `postgres://...` и укажите в Render.

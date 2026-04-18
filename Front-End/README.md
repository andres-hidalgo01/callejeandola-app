# 🛹 Callejeandola App

Aplicación web enfocada en la comunidad de skateboarding en Costa Rica y LATAM.

Permite descubrir:

* Spots (lugares para patinar)
* Eventos (competencias, jams, sesiones)
* Skateshops (tiendas locales)
* Perfil de usuario (favoritos, actividad)

---

## 🧱 Arquitectura

Proyecto dividido en dos partes principales:

### Frontend

* HTML / CSS / JS (Vanilla)
* UI basada en tabs (SPA simple)
* Render dinámico desde `app.js`

### Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* Swagger (opcional)

---

## 📁 Estructura del proyecto

```
CALLEJEANDOLAAPP/

Back-End/
  src/
    controllers/
    routes/
    services/
    utils/
    config/
  prisma/
    schema.prisma
  .env
  package.json

Front-End/
  assets/
  js/
    app.js
    api.js
    i18n.js
  styles/
    global.css
  index.html

vercel.json
README.md
```

---

## 🚀 Setup local

### 1. Backend

```bash
cd Back-End
npm install
```

Crear `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/callejeandola"
PORT=3000
```

Ejecutar Prisma:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

Levantar server:

```bash
npm run dev
```

---

### 2. Frontend

Abrir directamente:

```
Front-End/index.html
```

o usar Live Server.

---

## 🔌 API Endpoints

### Spots

* GET `/api/spots`
* GET `/api/spots/:id`

### Events

* GET `/api/events`
* GET `/api/events/:id`

### Shops

* GET `/api/shops`
* GET `/api/shops/:id`

### Sponsors

* GET `/api/sponsors`

---

## 🧠 Flujo de datos

```
PostgreSQL → Prisma → Express API → api.js → app.js → UI
```

---

## 🎯 Estado actual

✔ UI funcional (tabs + cards)
✔ Filtros (spots / events / shops)
✔ KPI básicos
✔ Modal y navegación

🚧 En progreso:

* Conexión a DB real (Prisma)
* Favoritos persistentes
* Registro a eventos
* Roles (User / Organizer)

---

## 📌 Roadmap corto

1. Conectar frontend a backend real
2. Eliminar mocks
3. Implementar favoritos (DB)
4. Registro a eventos
5. Panel organizer
6. Monetización (shops + eventos)

---

## ⚠️ Notas

* Se eliminó lógica de clips para mantener simplicidad
* Se eliminó estructura multipágina → ahora es SPA
* i18n está preparado pero no completo

---

## 👨‍💻 Autor

Andres Hidalgo
Automation Engineer → Fullstack → Security (en transición)

---

## 🔥 Visión

Callejeandola no es solo una app, es:

> infraestructura digital para la escena skate en LATAM
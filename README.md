
# Red Social - TP PARCIAL 2 - Backend (Nest)


Aplicación backend desarrollada con **NestJS** que expone una API REST para gestionar usuarios, autenticación JWT, publicaciones, comentarios, estadísticas y control de acceso basado en roles.  
Implementa validaciones robustas, arquitectura modular y comunicación segura con el frontend desarrollado en Angular.

---

## 📋 Indice

- [👨‍💼 Información del Proyecto](#-información-del-proyecto)
- [🔗 Links importantes](#-links-importantes)
- [🔧 Tecnologías utilizadas](#-tecnologías-utilizadas)
- [🌟 Características generales](#-características-generales)
- [🤝 Funcionalidades por Sprint](#-funcionalidades-por-sprint)

---

## 👨‍💼 Información del Proyecto

- **Nombres**: Luca Franco
- **Apellidos**: Gargiulo Nicola
- **Materia**: Programación IV
- **Nivel**: 4° Cuatrimestre
- **Comisión**: 2025 C1
- **Docente:** Rodrigo Plazas  
- **Tipo de Examen**: Segundo Parcial

---

## 🔗 Links importantes

-🔗 **Repositorio GitHub**: *[https://github.com/lucag316/LUCA-GARGIULO-progra-4-parcial-2-BACK]*

---

## 🔧 Tecnologías utilizadas

### 🌐 Backend:

- [NestJS](https://nestjs.com/) (modular, basado en decoradores)
- TypeScript
- MongoDB + Mongoose
- JSON Web Token (JWT)

### 🎓 Utilidades y herramientas:

- `class-validator`, `class-transformer`
- `multer` para manejo de archivos
- Guards personalizados: `JwtAuthGuard`, `JwtAdminGuard`
- Pipes personalizados para validación de archivos (imágenes)
- Encriptación de contraseñas con `bcrypt`

---

## 🌟 Características generales

- 🔐 **Registro/Login** con validaciones robustas
- 🧂 **Contraseñas encriptadas**
- 📌 **JWT** con expiración y sistema de **renovación segura**
- 👥 **Roles de usuario**: `usuario` y `administrador`
- 📷 Soporte de **subida de imágenes** para perfiles y publicaciones
- 🧼 **Alta y baja lógica** de usuarios y publicaciones
- 📊 Módulo de **estadísticas exclusivas para administradores**
- 🧱 Arquitectura modular: `auth`, `users`, `posts`, `estadisticas`
- ✅ Validaciones con DTOs + pipes personalizados

---

## 🧑‍💼 Funcionalidades por Sprint

### 🟢 Sprint 1

#### 📅 Consigna (Entrega: 09/06):

- Creación del proyecto backend con NestJS.
- Creación de módulos base:
  - `auth` para autenticación.
  - `users` para gestión de usuarios.
  - `posts` para publicaciones.
- Implementación de rutas de autenticación:
  - `POST /auth/registro`: registro de nuevos usuarios.
    - Validación de datos.
    - Encriptación de contraseña.
    - Guardado de imagen de perfil (con Multer) y URL asociada en la base.
  - `POST /auth/login`: inicio de sesión.
    - Recepción de usuario/correo y contraseña.
    - Verificación con contraseña encriptada.
    - Devolución de datos del usuario y JWT.

#### ✅ Resolución

Durante este primer sprint se sentaron las bases fundamentales del backend en NestJS:

- Proyecto inicial creado con estructura modular.
- Módulo `auth` implementado:
  - Validaciones con `class-validator`.
  - Registro y login funcionales con JWT generado.
  - Contraseñas protegidas con `bcrypt`.
  - Manejo de imágenes de perfil a través de `multer` y pipes de validación.
- Módulo `users` creado con esquema `UserSchema` que incluye:
  - Atributos como rol, imagen, fecha de nacimiento, descripción, etc.
  - Valor por defecto del rol como `usuario`.
- Base de datos MongoDB conectada y funcional.
- Documentación interna de las rutas iniciales.
- Estructura de DTOs robusta y reutilizable.

---

### 🟢 Sprint 2

#### 📅 Consigna (Entrega: 16/06):

- Desarrollo del `PostsController` para publicaciones:
  - `POST`: alta de publicaciones con título, descripción, imagen y usuario asociado.
  - `DELETE`: baja lógica (sólo autor o administrador).
  - `GET`: listado de publicaciones con filtros:
    - Orden por fecha o likes.
    - Filtro por autor.
    - Paginación (`offset`, `limit`).
  - `POST`: dar like a una publicación (una vez por usuario).
  - `DELETE`: quitar like si el usuario lo había dado antes.

#### ✅ Resolución

Este sprint permitió implementar el core del sistema de publicaciones:

- Se creó el módulo `posts` con sus DTOs, servicios y esquemas.
- El controlador maneja correctamente:
  - Alta de publicaciones con validación de usuario autenticado.
  - Baja lógica mediante flag `activo: false`.
  - Registro y eliminación de likes en array interno por usuario.
- Se agregó lógica para evitar likes duplicados por el mismo usuario.
- Las imágenes de publicaciones se almacenan con Multer y validación de formato.
- Se añadió guard de autorización (`JwtAuthGuard`) a las rutas protegidas.

---

### 🟢 Sprint 3

#### 📅 Consigna (Entrega: 23/06):

- Desarrollo del `ComentariosController` dentro de publicaciones:
  - `POST`: agregar comentario (requiere usuario logueado).
  - `PUT`: modificar comentario, agregando `modificado: true`.
  - `GET`: listar comentarios de una publicación.
    - Ordenados del más reciente al más antiguo.
    - Paginados.
- Mejora en la autenticación:
  - JWT con vencimiento de 15 minutos.
  - Rutas:
    - `POST /auth/autorizar`: valida si el token es válido.
    - `POST /auth/refrescar`: emite un nuevo token si aún no venció.

#### ✅ Resolución

Durante este sprint se profundizó en la interacción de usuarios y control de sesiones:

- Se integró el subcontrolador `comentarios` con lógica completa:
  - Los comentarios están embebidos en el documento de la publicación.
  - Se permite modificarlos, marcando `modificado: true`.
  - Se añadió lógica para mantener el historial limpio y consistente.
- Paginación e indexado en comentarios para eficiencia.
- Se mejoró el módulo `auth`:
  - El JWT ahora vence a los 15 minutos.
  - Se agregó ruta `autorizar` para validación inicial al cargar el frontend.
  - Ruta `refrescar` que permite extender la sesión de forma segura.
- Guards reforzados para proteger rutas sensibles.
- Implementación limpia de control de expiración y respuesta `401` adecuada.

---

### 🟢 Sprint 4

#### 📅 Consigna (Entrega: 30/06):

- Ampliar el módulo de usuarios:
  - Listado de usuarios (solo admin).
  - Alta y baja lógica.
  - Alta de nuevos usuarios administradores.
- Crear el módulo de estadísticas:
  - `GET /posts/estadisticas/publicaciones-usuario`
  - `GET /posts/estadisticas/comentarios-publicacion`
  - `GET /posts/estadisticas/comentarios-fecha`
- Validar todas estas rutas con `JwtAdminGuard`.

#### ✅ Resolución

Sprint final con enfoque en administración y analítica:

- Se completó el `UsersController`:
  - Listado general de usuarios con filtro de inactivos.
  - Endpoints para dar de baja (DELETE) y rehabilitar usuarios (POST).
  - Alta de nuevos usuarios (administrador) vía DTO validado.
- Se agregó validación estricta por `JwtAdminGuard` a estas rutas.
- Se desarrolló el `EstadisticasController` en el módulo `posts`:
  - Rutas GET funcionales y protegidas.
  - Acceso sólo para usuarios con rol `admin`.
  - Lógica agregada usando agregaciones de MongoDB para:
    - Cantidad de publicaciones por usuario.
    - Comentarios por publicación.
    - Comentarios totales en un período determinado.
- Todas las estadísticas están preparadas para ser consumidas por el frontend como datasets para gráficos.

---

✅ **Estado final:** El backend cumple con todas las funcionalidades requeridas en cada sprint. Cuenta con validaciones sólidas, control de acceso, lógica robusta, modularización limpia y está 100% integrado con el frontend Angular de la aplicación.

📌 [Volver al índice](#-indice)
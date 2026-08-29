# Plan de trabajo — AutoFac (frontend)

Lista viva de tareas de diseño/frontend. Se actualiza a medida que avanzamos o surgen tareas nuevas. Para el roadmap completo del proyecto (seguridad, login, productos, OAuth2, despliegue) ver el plan aprobado en `C:\Users\0.0\.claude\plans\snazzy-gathering-manatee.md`.

## En progreso ahora

- [ ] Nada activo ahora mismo — elegir siguiente ítem de "Pendiente / próximo".

## Pendiente / próximo

- [ ] **Responsive de las tablas** (ej. `registros`, `table-custom`) — revisar que se vean bien en pantallas chicas.
- [ ] **Responsive de la vista de documentos** (grid pública y panel admin) — revisar en pantallas chicas.
- [ ] **Botón/link para volver al home** en la vista pública de documentos (`/documentos`) — hoy no hay forma de regresar a la landing, el usuario queda "atrapado" ahí.
- [ ] **Reorganizar "Home" del panel admin**: hoy `/admin/home` muestra el botón de capturar factura (Siigo). La idea es que el link "Home" del sidebar admin lleve a la landing pública, y la funcionalidad de captura de facturas se mueva a su propio ítem del menú (con su propio nombre, no "Home") — hay que decidir el nombre y si es un componente nuevo o solo renombrar/mover el existente.
- [ ] **Optimizar imágenes al subir documentos**: cuando el archivo subido sea una imagen, convertirla automáticamente a formato optimizado (`.webp` u otro) en vez de guardar el original tal cual — reduce peso y mejora carga. Se implementaría en `DocumentoService.guardar()` (backend), probablemente con una librería de procesamiento de imágenes en Java (ej. `Thumbnailator`, o `ImageIO` con un encoder webp).
- [ ] **Modal de vista previa para documentos**: al hacer click en un documento (público y/o admin), abrir una previsualización del archivo sin descargarlo — modal centrado en la pantalla, fondo oscurecido (overlay), con opción de cerrar. Aplica al menos a PDFs e imágenes (los formatos que el navegador puede renderizar inline vía `<iframe>`/`<img>`); para Word/Excel evaluar si se previsualiza o se deja solo con descarga.
- [ ] **Responsive del nav de la landing** (el menú de links se oculta en pantallas chicas — `hidden md:flex` — falta un botón hamburguesa/menú móvil para esos tamaños).
- [ ] Revisar si `registros` y `home` tienen el mismo bug de change detection que se encontró y parchó en `documentos` (Angular 22 + `subscribe()` sin `ChangeDetectorRef.detectChanges()` → la vista no se refresca sola). Aplicar el mismo parche si están afectados.
- [ ] Refactorizar `*ngIf`/`*ngFor` a `@if`/`@for` en el resto del proyecto (`landing`, `registros`, `home`, `admin/documentos`, etc.) — ya se hizo en `public/documentos`, falta el resto.
- [ ] (Futuro, no urgente) Migrar el bootstrap de `main.ts` de `bootstrapModule(AppModule)` clásico a `bootstrapApplication` standalone — solución de raíz al bug de change detection, en vez de parchear componente por componente.
- [ ] Comitear los cambios sueltos actuales.
- [ ] **Librería de alertas/confirmaciones modernas** (mencionaste "Swagger" pero eso es para documentar APIs, no para alertas — seguramente te refieres a **SweetAlert2** o similar) para reemplazar los `confirm()`/`alert()` nativos del navegador (ej. el `confirm()` que usamos al eliminar un documento).
- [ ] **Variables CSS declaradas arriba del archivo** en `styles.css` (colores/constantes como `:root { --color-primary: ... }` referenciadas en el resto del documento) — buena práctica de mantenibilidad, hoy los colores viven solo en `tailwind.config.js`, faltaría también tenerlos como variables CSS nativas dentro de `styles.css`.
- [ ] **(Backend) Optimizar clases con Lombok**: `lombok` ya está como dependencia en `pom.xml` pero casi no se usa. Revisar `entity`/DTOs y reemplazar getters/setters manuales por anotaciones (`@Getter`, `@Setter`, o `@Data`/`@Builder` según el caso) para ahorrar código repetitivo.
- [ ] **Actividad de aprendizaje: dominar Spring Security + JWT desde cero**. El usuario quiere entender a fondo todo lo que se armó en la autenticación (no solo tenerlo funcionando) — pidió una explicación paso a paso, línea por línea: qué archivo se crea primero, en qué orden, para qué sirve cada variable/anotación/método (`@Value`, `SecretKey`, `Jwts.builder()`, `UserDetailsService`, `DaoAuthenticationProvider`, `SecurityFilterChain`, `OncePerRequestFilter`, etc.), y por qué va en ese orden. Después de la explicación, armar ejercicios/retos para que practique construyendo un login+JWT de cero por su cuenta hasta dominarlo ("que después pueda crear logins con los ojos cerrados"). Formato sugerido: documento o sesión dedicada, no mezclarlo con el desarrollo real del proyecto.
- [ ] **(Backend) Manejo de errores personalizado**: crear excepciones propias (ej. `CredencialesInvalidasException`, `ValidacionException`) y `@ExceptionHandler`/`@RestControllerAdvice` centralizados para devolver mensajes de error consistentes y útiles en el JSON de respuesta (hoy los errores de validación de `@Valid` devuelven el JSON genérico de Spring, sin el detalle de qué campo falló).
- [ ] **Mejorar el diseño visual del login admin** — hoy es un formulario muy básico (funcional, sin estilo cuidado). Aplicar el mismo enfoque de estilos centralizados en `styles.css` usado en el resto del proyecto.
- [ ] **(Futuro, hardening) Evaluar mover el JWT de `localStorage` a una cookie `httpOnly`** — hoy el token vive en `localStorage`, vulnerable solo ante XSS (no ante acceso externo directo). Cambiar a cookie `httpOnly` lo protege de XSS pero exige manejar CSRF en su lugar — evaluar si vale la pena para el alcance de este proyecto.
- [ ] **(Backend) Sacar los orígenes de CORS a variables de entorno**: hoy en `SecurityConfig.corsConfigurationSource()` las URLs (`http://localhost:4200`, `https://autofac.modoblu.com`) están escritas directo en el código. Pasarlas a `application.properties` como `${CORS_ORIGINS:...}` (lista separada por comas) para no tener que tocar y recompilar código Java cuando cambie el dominio — recordar que `modoblu.com` vence ~sep. 2026 y ya hay plan de migración a otro dominio.

## En progreso ahora

- [ ] Nada activo ahora mismo — elegir siguiente ítem de "Pendiente / próximo".

## Ya hecho (contexto, no repetir)

- **Login + autenticación completos (backend y frontend)**: `POST /api/auth/login` genera JWT real (Spring Security + JWT), `iUsuarioRepository`/`Usuario`/`UsuarioDetailsService`/`JwtService`/`JwtAuthFilter`/`SecurityConfig`. Frontend: `AuthService`, `authInterceptor`, `authGuard` (bloquea `/admin/**` sin sesión, redirige a `/admin/login`), `LoginComponent` con validaciones. Verificado de punta a punta con Insomnia y por UI.
- **Auto-logout por inactividad + botón "Cerrar sesión"**: `InactivityService` (timer de 15 min, se resetea con mouse/teclado/click/scroll), wireado en `dash-board.component.ts`. Botón de logout como `<div class="sideBar-logout">` independiente (hermano de `<ul>` dentro de `.sideBar`, no como `<li>` del menú) — solo visible si `authService.isAuthenticated()`, con el mismo efecto de curva blanca que el resto del sidebar (arriba y abajo) activado en hover, alineación de ícono/texto corregida. Se corrigió también un bug de scrollbar en el sidebar (`overflow-x: hidden` sin `overflow-y` hace que el navegador calcule `overflow-y: auto` automáticamente — se agregó `overflow-y: hidden` explícito).

- Auditoría de seguridad inicial (credenciales fuera del código), actualización de Angular 15 → 22, separación de rutas público/admin, despliegue Docker funcionando en el servidor (ver plan principal para el detalle completo).
- Módulo `documentos` (público): backend completo (subir/listar/descargar) + grid pública de archivos funcionando.
- **Hero de la landing rediseñado** (imagen real a pantalla completa, nav superpuesto dentro de la sección, sin el marco celeste que venía del `app-bg` global). Se movió `app-bg` de `app.component.html` (envolvía toda la app) a `dash-board.component.html` (solo el panel admin lo necesita). Nuevas clases `.landing-*` centralizadas en `styles.css`.
- **CRUD completo de documentos (admin)**: agregado `eliminar` (borra archivo físico + fila en BD, en ese orden para no dejar basura) y `actualizar` (renombrar y/o reemplazar el archivo) en backend (`iDocumentoService`, `DocumentoService`, `DocumentoController` — `DELETE`/`PUT /api/documento/{id}`) y frontend (`DocumentosService.eliminar()`/`actualizar()`, componente `admin/documentos` con panel de edición inline y botones Editar/Eliminar en la tabla). Eliminar/actualizar solo existen en la vista admin, nunca en la pública — el backend en sí sigue sin autenticación (decisión ya tomada, se protege de verdad en el Paso 4/5).
- **Bug del input de archivo corregido**: usando `@ViewChild` + `nativeElement.value = ''` para limpiar el `<input type="file">` nativo tras subir/editar con éxito (tanto en el input de "subir nuevo" como en el del panel de edición).
- **Módulo del blog de la universidad**: hecho (confirmado por el usuario).

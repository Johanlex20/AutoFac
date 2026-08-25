# Plan de trabajo — AutoFac (frontend)

Lista viva de tareas de diseño/frontend. Se actualiza a medida que avanzamos o surgen tareas nuevas. Para el roadmap completo del proyecto (seguridad, login, productos, OAuth2, despliegue) ver el plan aprobado en `C:\Users\0.0\.claude\plans\snazzy-gathering-manatee.md`.

## En progreso ahora

- [ ] Nada activo ahora mismo — elegir siguiente ítem de "Pendiente / próximo".

## Pendiente / próximo

- [ ] **Modal de vista previa para documentos**: al hacer click en un documento (público y/o admin), abrir una previsualización del archivo sin descargarlo — modal centrado en la pantalla, fondo oscurecido (overlay), con opción de cerrar. Aplica al menos a PDFs e imágenes (los formatos que el navegador puede renderizar inline vía `<iframe>`/`<img>`); para Word/Excel evaluar si se previsualiza o se deja solo con descarga.
- [ ] **Responsive del nav de la landing** (el menú de links se oculta en pantallas chicas — `hidden md:flex` — falta un botón hamburguesa/menú móvil para esos tamaños).
- [ ] Revisar si `registros` y `home` tienen el mismo bug de change detection que se encontró y parchó en `documentos` (Angular 22 + `subscribe()` sin `ChangeDetectorRef.detectChanges()` → la vista no se refresca sola). Aplicar el mismo parche si están afectados.
- [ ] Refactorizar `*ngIf`/`*ngFor` a `@if`/`@for` en el resto del proyecto (`landing`, `registros`, `home`, `admin/documentos`, etc.) — ya se hizo en `public/documentos`, falta el resto.
- [ ] (Futuro, no urgente) Migrar el bootstrap de `main.ts` de `bootstrapModule(AppModule)` clásico a `bootstrapApplication` standalone — solución de raíz al bug de change detection, en vez de parchear componente por componente.
- [ ] Comitear los cambios sueltos actuales.
- [ ] **Librería de alertas/confirmaciones modernas** (mencionaste "Swagger" pero eso es para documentar APIs, no para alertas — seguramente te refieres a **SweetAlert2** o similar) para reemplazar los `confirm()`/`alert()` nativos del navegador (ej. el `confirm()` que usamos al eliminar un documento).
- [ ] **Variables CSS declaradas arriba del archivo** en `styles.css` (colores/constantes como `:root { --color-primary: ... }` referenciadas en el resto del documento) — buena práctica de mantenibilidad, hoy los colores viven solo en `tailwind.config.js`, faltaría también tenerlos como variables CSS nativas dentro de `styles.css`.

## En progreso ahora (auth)

- [ ] **Construir login + autenticación completos** (no el stub simulado del plan original — vamos directo a la versión real: backend Spring Security + JWT, y frontend ya conectado).
  - Requisito confirmado: cerrar sesión automáticamente por inactividad (tiempo sin actividad del usuario).
  - Pendiente de aclarar con el usuario: si "entre navegadores" significa solo que la protección sea real en el backend (ya cubierto por JWT), o si además quiere una sola sesión activa por usuario a la vez (invalidar sesiones anteriores al loguearse en otro navegador) — esto último es más complejo y rompe el modelo JWT stateless.

## Ya hecho (contexto, no repetir)

- Auditoría de seguridad inicial (credenciales fuera del código), actualización de Angular 15 → 22, separación de rutas público/admin, despliegue Docker funcionando en el servidor (ver plan principal para el detalle completo).
- Módulo `documentos` (público): backend completo (subir/listar/descargar) + grid pública de archivos funcionando.
- **Hero de la landing rediseñado** (imagen real a pantalla completa, nav superpuesto dentro de la sección, sin el marco celeste que venía del `app-bg` global). Se movió `app-bg` de `app.component.html` (envolvía toda la app) a `dash-board.component.html` (solo el panel admin lo necesita). Nuevas clases `.landing-*` centralizadas en `styles.css`.
- **CRUD completo de documentos (admin)**: agregado `eliminar` (borra archivo físico + fila en BD, en ese orden para no dejar basura) y `actualizar` (renombrar y/o reemplazar el archivo) en backend (`iDocumentoService`, `DocumentoService`, `DocumentoController` — `DELETE`/`PUT /api/documento/{id}`) y frontend (`DocumentosService.eliminar()`/`actualizar()`, componente `admin/documentos` con panel de edición inline y botones Editar/Eliminar en la tabla). Eliminar/actualizar solo existen en la vista admin, nunca en la pública — el backend en sí sigue sin autenticación (decisión ya tomada, se protege de verdad en el Paso 4/5).
- **Bug del input de archivo corregido**: usando `@ViewChild` + `nativeElement.value = ''` para limpiar el `<input type="file">` nativo tras subir/editar con éxito (tanto en el input de "subir nuevo" como en el del panel de edición).
- **Módulo del blog de la universidad**: hecho (confirmado por el usuario).

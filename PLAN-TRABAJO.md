# Plan de trabajo — AutoFac (frontend)

Lista viva de tareas de diseño/frontend. Se actualiza a medida que avanzamos o surgen tareas nuevas. Para el roadmap completo del proyecto (seguridad, login, productos, OAuth2, despliegue) ver el plan aprobado en `C:\Users\0.0\.claude\plans\snazzy-gathering-manatee.md`.

## En progreso ahora

- [ ] Nada activo ahora mismo — elegir siguiente ítem de "Pendiente / próximo".

## Pendiente / próximo

- [ ] **Responsive del nav de la landing** (el menú de links se oculta en pantallas chicas — `hidden md:flex` — falta un botón hamburguesa/menú móvil para esos tamaños).
- [ ] Reutilizar el mismo hero/estilo para el módulo de **blog de la universidad** (3 documentos: descripción del producto/servicio, plan de formación, pertinencia y aval — contenido ya redactado por el usuario).
- [ ] Construir el panel admin para subir documentos (`src/app/documentos-admin/`, ruta `/admin/documentos`) — backend ya listo y probado.
- [ ] Revisar si `registros` y `home` tienen el mismo bug de change detection que se encontró y parchó en `documentos` (Angular 22 + `subscribe()` sin `ChangeDetectorRef.detectChanges()` → la vista no se refresca sola). Aplicar el mismo parche si están afectados.
- [ ] Migrar `documentos.component.html` a la convención de estilos centralizados (se construyó antes de tomar esa decisión, hoy tiene clases de Tailwind sueltas).
- [ ] (Futuro, no urgente) Migrar el bootstrap de `main.ts` de `bootstrapModule(AppModule)` clásico a `bootstrapApplication` standalone — solución de raíz al bug de change detection, en vez de parchear componente por componente.
- [ ] Comitear los cambios sueltos actuales (`public-routing.module.ts`, `main.ts`, carpetas `documentos`/`assets/img` sin trackear).

## Ya hecho (contexto, no repetir)

- Auditoría de seguridad inicial (credenciales fuera del código), actualización de Angular 15 → 22, separación de rutas público/admin, despliegue Docker funcionando en el servidor (ver plan principal para el detalle completo).
- Módulo `documentos`: backend completo (subir/listar/descargar) + grid pública de archivos funcionando.
- **Hero de la landing rediseñado** (imagen real a pantalla completa, nav superpuesto dentro de la sección, sin el marco celeste que venía del `app-bg` global). Se movió `app-bg` de `app.component.html` (envolvía toda la app) a `dash-board.component.html` (solo el panel admin lo necesita). Nuevas clases `.landing-*` centralizadas en `styles.css`.

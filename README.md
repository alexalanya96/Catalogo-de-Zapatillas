# A&A Urban Store — diseño original + administración

Este paquete mantiene como base el diseño y la estructura del proyecto que compartiste: `index.html`, `styles.css` y la lógica de tienda de `script.js`. Se integró la lectura de productos desde Supabase sin reemplazar el diseño visual del catálogo. Si Supabase aún no está configurado, el catálogo conserva los productos de muestra que ya estaban en tu `script.js`.

## Incluye
- `index.html`, `styles.css`, `script.js`: tu tienda original, con carrito, filtros, galería/modal, tallas agotadas y pedido por WhatsApp.
- `admin.html`, `admin.js`: panel protegido con CRUD de productos: crear, listar, editar y eliminar; administra nombre, marca, categoría, precio, etiqueta/badge, tallas, stock por talla, imagen principal y galería de fotos.
- `supabase-schema.sql`: tablas, políticas RLS y bucket `product-images` con reglas de Storage.
- `supabase-config.js.example`: plantilla de configuración.

## Activación
1. Crea un proyecto en Supabase.
2. Ejecuta `supabase-schema.sql` en SQL Editor.
3. En Authentication > Settings, desactiva el registro público.
4. En Authentication > Users, crea el usuario del propietario y copia su UUID.
5. En SQL Editor ejecuta el INSERT comentado al final de `supabase-schema.sql`, reemplazando el UUID y el nombre.
6. Copia `supabase-config.js.example` como `supabase-config.js` y coloca la Project URL y la clave publicable/anon. No uses nunca la clave `service_role` en el navegador.
7. Sube todos los archivos a la raíz del repositorio GitHub Pages.
8. Abre `admin.html` para iniciar sesión y gestionar los productos. Selecciona varias fotos desde tu computadora; el panel las previsualiza y las sube a `product-images` al guardar.

## Administradores y permisos
Crea las cuentas de los encargados desde Supabase Authentication y asígnales un perfil en `user_profiles`. Ejemplo:
```sql
insert into public.user_profiles(user_id,display_name,role,permissions)
values('UUID-DEL-USUARIO','Encargado de inventario','inventory',array['products_update']);
```
Permisos: `products_create`, `products_update`, `products_delete`. El rol `owner` tiene acceso completo a productos. La creación de usuarios no está expuesta en el sitio público.

## Importante
- Los cambios hechos en el panel se leen desde Supabase en el catálogo público. La categoría y el badge se sincronizan con la tienda; el campo funcional `Talla` se almacena en `products.sizes` como JSONB para conservar compatibilidad con el código de catálogo ya existente.
- Los productos locales originales sirven como vista previa si no hay configuración; una vez configurado Supabase, el catálogo usa los productos publicados en la base de datos.
- Las fotos locales referenciadas como `img/...` deben subirse también al repositorio manteniendo esa misma estructura de carpetas, o sustituirse por URLs públicas desde el panel.
- El WhatsApp comercial del código original se conserva (`51968233506`).
- Antes de usar con clientes, prueba login, roles, permisos y pedidos en un entorno de prueba.

insert into public.user_profiles(user_id,display_name,role,permissions)
values('123e4567-e89b-12d3-a456-426614174000','Encargado de inventario','inventory',array['products_update']);

## Fotos desde la computadora (versión corregida)
- El selector acepta varias imágenes y muestra una vista previa antes de guardar.
- Puedes quitar fotos nuevas o ya asociadas al producto.
- Al guardar, las fotos nuevas se suben a Supabase Storage, bucket `product-images`.
- La primera foto será la imagen principal (`image_url`) y todas las fotos quedan asociadas en `gallery`.
- Máximo 8 MB por foto; formatos permitidos: JPEG, PNG, WebP, GIF y AVIF.
- Ejecuta el `supabase-schema.sql` actualizado para crear el bucket y las políticas Storage.
- Las fotos son públicas para que la tienda pueda mostrarlas; subir imágenes requiere iniciar sesión y permisos de producto. Nunca publiques la clave `service_role`.

## Campos del CRUD integrado
- `brand`: marca del producto.
- `category`: categoría usada por los filtros del catálogo.
- `sizes` (equivalente a `Talla`): arreglo de tallas, por ejemplo `["23","24","25"]`.
- `stock`: existencias por talla, por ejemplo `{ "23": 0, "24": 1, "25": 1 }`.
- `badge`: etiqueta comercial como `NUEVO`, `POPULAR` u `OFERTA`.
- `image_url` (equivalente a `image`) y `gallery`: URLs públicas de fotos alojadas en Supabase Storage.

Si ya ejecutaste el SQL anterior, vuelve a ejecutar el archivo actualizado: añade las columnas `category` y `badge` sin borrar los productos existentes.

## Actualización responsive y formulario de pedidos

- Se conservaron las carpetas, imágenes y archivos originales del catálogo y del panel de administración.
- La sección **Nueva colección** ahora se muestra en pantallas móviles y adapta la imagen al ancho disponible.
- El botón de confirmar pedido abre un formulario con nombre, teléfono, entrega, distrito/ciudad, dirección opcional, método de pago e indicaciones.
- Al enviar, se prepara un mensaje con los productos, tallas, cantidades, total y datos del cliente para enviarlo al WhatsApp de ventas configurado en `script.js`.
- Para mostrar el QR real de Yape, guarda la imagen QR completa y escaneable como `img/yape-qr.png`.
- En `script.js`, revisa `WHATSAPP_SALES_NUMBER`, `YAPE_OWNER` y `YAPE_NUMBER` antes de publicar. Los datos del ejemplo de pago deben confirmarse con el titular de la cuenta.
- El enlace de WhatsApp no valida pagos ni descuenta inventario automáticamente; la tienda debe confirmar el pago y el stock manualmente.

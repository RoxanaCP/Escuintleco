# Matriz de Casos de Prueba

Proyecto: Las Casas del Escuintleco

Este documento registra los casos de prueba diseñados y ejecutados, con su
identificador, tipo, entrada, resultado esperado y estado. Todas las pruebas se
ejecutan automáticamente en el pipeline CI/CD.

Leyenda de tipos: **U** = Unitaria · **I** = Integración · **E2E** = End-to-End

Las columnas de "Entrada" y "Resultado esperado" describen el comportamiento que
verifica cada caso. El detalle de cada aserción está en el archivo de pruebas indicado.

---

## 1. Backend — Pruebas Unitarias de Servicios (JUnit 5 + Mockito)

### 1.1 ProductoService (`ProductoServiceTest`)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BU-01 | U | Listar productos activos | Repositorio con 2 productos activos | Devuelve lista de 2 productos | Aprobada |
| BU-02 | U | Buscar producto por id existente | id = 1 | Devuelve el producto "Fideos" | Aprobada |
| BU-03 | U | Buscar producto por id inexistente | id = 99 | Lanza excepción "no encontrado" | Aprobada |
| BU-04 | U | Guardar producto nuevo | Producto sin id | Guarda y asigna fecha de creación | Aprobada |
| BU-05 | U | Actualizar producto | id = 1 + datos nuevos | Devuelve producto con datos actualizados | Aprobada |
| BU-06 | U | Eliminar producto (soft-delete) | id = 1 | El producto queda con activo = false | Aprobada |

### 1.2 VentaService (`VentaServiceTest`)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BU-07 | U | Calcular subtotal y total | Venta de 5 unidades a Q8.00 | subtotal = Q40.00, total = Q40.00 | Aprobada |
| BU-08 | U | Descontar stock al vender | Producto con stock 100, vende 10 | Stock queda en 90 | Aprobada |
| BU-09 | U | Stock insuficiente | Producto con stock 3, vende 10 | Lanza excepción "Stock insuficiente" | Aprobada |
| BU-10 | U | Usuario inexistente en venta | username = "fantasma" | Lanza excepción "Usuario no encontrado" | Aprobada |
| BU-11 | U | Generar número de factura y QR | Venta válida | numeroFactura inicia con "FAC-" y genera QR | Aprobada |
| BU-12 | U | Buscar venta inexistente | id = 99 | Lanza excepción "no encontrada" | Aprobada |
| BU-13 | U | Listar todas las ventas | Repositorio con 1 venta | Devuelve lista de 1 venta | Aprobada |

### 1.3 DevolucionService (`DevolucionServiceTest`)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BU-14 | U | Devolver stock al inventario | Devolución de 5 unidades, stock 50 | Stock queda en 55 | Aprobada |
| BU-15 | U | Registrar datos de la devolución | Cantidad 3, motivo DANO | Devolución con cantidad, motivo, producto y fecha | Aprobada |
| BU-16 | U | Cantidad igual a cero | cantidad = 0 | Lanza excepción "mayor que cero", no guarda | Aprobada |
| BU-17 | U | Cantidad negativa | cantidad = -2 | Lanza excepción "mayor que cero" | Aprobada |
| BU-18 | U | Cantidad nula | cantidad = null | Lanza excepción "mayor que cero" | Aprobada |
| BU-19 | U | Producto inexistente | productoId sin registro | Lanza excepción "Producto no encontrado" | Aprobada |
| BU-20 | U | Listar devoluciones | Repositorio con 2 devoluciones | Devuelve lista de 2 | Aprobada |

### 1.4 CajaService (`CajaServiceTest`)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BU-21 | U | Abrir caja | Monto Q500.00, usuario admin | Caja ABIERTA con monto y fecha de hoy | Aprobada |
| BU-22 | U | Abrir caja con usuario inexistente | username = "nadie" | Guarda la caja sin usuarioId | Aprobada |
| BU-23 | U | Cerrar caja con ventas | Apertura Q500 + ventas Q100 y Q50.50 | Monto de cierre Q650.50, estado CERRADA | Aprobada |
| BU-24 | U | Cerrar caja sin ventas | Apertura Q300, sin ventas | Monto de cierre Q300 | Aprobada |
| BU-25 | U | Cerrar sin caja abierta | No hay caja ABIERTA hoy | Lanza excepción "No hay caja abierta" | Aprobada |
| BU-26 | U | Corte del día | 3 ventas (Q125) + apertura Q200 | 3 transacciones, total en caja Q325 | Aprobada |
| BU-27 | U | Corte sin apertura ni ventas | Sin datos | Todos los totales en cero | Aprobada |

### 1.5 AuthService (`AuthServiceTest`)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BU-28 | U | Login con credenciales válidas | admin / admin123 | Devuelve token, usuario, nombre y rol | Aprobada |
| BU-29 | U | Login con credenciales inválidas | admin / contraseña mala | Propaga BadCredentialsException, no genera token | Aprobada |
| BU-30 | U | Usuario autenticado inexistente en BD | username sin registro | Lanza excepción "Usuario no encontrado" | Aprobada |

### 1.6 QrService (`QrServiceTest`)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BU-31 | U | Generar QR | Texto de factura | Devuelve "data:image/png;base64,..." | Aprobada |
| BU-32 | U | El QR es un PNG válido | Texto cualquiera | Los bytes inician con la firma PNG | Aprobada |
| BU-33 | U | Contenidos distintos | Dos textos diferentes | Imágenes distintas | Aprobada |
| BU-34 | U | Mismo contenido | Mismo texto dos veces | Imágenes idénticas | Aprobada |

## 2. Backend — Pruebas Unitarias de Seguridad (JUnit 5)

### 2.1 JwtUtil (`JwtUtilTest`)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BU-35 | U | Generar token | Usuario y rol | Token con 3 partes | Aprobada |
| BU-36 | U | Extraer usuario del token | Token de "cajero1" | Devuelve "cajero1" | Aprobada |
| BU-37 | U | Validar token válido | Token recién generado | true | Aprobada |
| BU-38 | U | Validar token malformado | "esto.no.es-un-jwt" | false | Aprobada |
| BU-39 | U | Validar cadena vacía | "" | false (defecto corregido) | Aprobada |
| BU-40 | U | Token firmado con otro secreto | Token ajeno | false | Aprobada |
| BU-41 | U | Token expirado | Expiración negativa | false | Aprobada |

### 2.2 JwtFilter (`JwtFilterTest`)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BU-42 | U | Token válido | Header "Bearer token-valido" | Usuario autenticado y la cadena continúa | Aprobada |
| BU-43 | U | Token inválido | Header con token malo | Sin autenticar, la cadena continúa | Aprobada |
| BU-44 | U | Sin header Authorization | Petición sin header | Sin autenticar, la cadena continúa | Aprobada |
| BU-45 | U | Header sin prefijo Bearer | "Basic abc123" | Se ignora, sin autenticar | Aprobada |

## 3. Backend — Pruebas de Integración de Controllers (MockMvc)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| BI-01 | I | GET /api/productos | Petición GET | Status 200 + lista con "PAS001" | Aprobada |
| BI-02 | I | GET /api/productos/{id} | id = 1 | Status 200 + producto "Fideos" | Aprobada |
| BI-03 | I | POST /api/productos | Producto en JSON | Status 200 + producto con id | Aprobada |
| BI-04 | I | PUT /api/productos/{id} | id = 1 + datos | Status 200 + producto actualizado | Aprobada |
| BI-05 | I | DELETE /api/productos/{id} | id = 1 | Status 204 | Aprobada |
| BI-06 | I | POST /api/auth/login | Credenciales válidas | Status 200 + token JWT | Aprobada |
| BI-07 | I | POST /api/ventas | Venta con 1 detalle | Status 200 + factura y total | Aprobada |
| BI-08 | I | GET /api/ventas/{id} | id = 5 | Status 200 + factura FAC-...-0005 | Aprobada |
| BI-09 | I | GET /api/ventas | Petición GET | Status 200 + lista de 2 ventas | Aprobada |
| BI-10 | I | POST /api/devoluciones | Devolución en JSON | Status 200 + devolución registrada | Aprobada |
| BI-11 | I | GET /api/devoluciones | Petición GET | Status 200 + lista con motivo y cantidad | Aprobada |
| BI-12 | I | POST /api/caja/abrir | montoApertura = 500 | Status 200 + caja ABIERTA | Aprobada |
| BI-13 | I | POST /api/caja/cerrar | Petición POST | Status 200 + caja CERRADA con monto de cierre | Aprobada |
| BI-14 | I | GET /api/caja/corte | Petición GET | Status 200 + resumen del día | Aprobada |
| BI-15 | I | GET /api/categorias | Petición GET | Status 200 + 2 categorías | Aprobada |
| BI-16 | I | POST /api/categorias | Categoría en JSON | Status 200 + categoría con id | Aprobada |
| BI-17 | I | GET /api/clientes | Petición GET | Status 200 + clientes activos | Aprobada |
| BI-18 | I | GET /api/clientes/nit/{nit} existente | NIT registrado | Status 200 + cliente | Aprobada |
| BI-19 | I | GET /api/clientes/nit/{nit} inexistente | NIT sin registro | Status 404 | Aprobada |
| BI-20 | I | POST /api/clientes | Cliente en JSON | Status 200 + cliente con id | Aprobada |
| BI-21 | I | PUT /api/clientes/{id} existente | id = 4 + datos | Status 200 + cliente modificado | Aprobada |
| BI-22 | I | PUT /api/clientes/{id} inexistente | id = 99 | Status 404 | Aprobada |
| BI-23 | I | GET /api/proveedores | Petición GET | Status 200 + proveedores activos | Aprobada |
| BI-24 | I | GET /api/proveedores/{id} existente | id = 1 | Status 200 + proveedor | Aprobada |
| BI-25 | I | GET /api/proveedores/{id} inexistente | id = 99 | Status 404 | Aprobada |
| BI-26 | I | POST /api/proveedores | Proveedor en JSON | Status 200 + proveedor con id | Aprobada |
| BI-27 | I | PUT /api/proveedores/{id} existente | id = 2 + datos | Status 200 + proveedor modificado | Aprobada |
| BI-28 | I | PUT /api/proveedores/{id} inexistente | id = 99 | Status 404 | Aprobada |
| BI-29 | I | DELETE /api/proveedores/{id} existente | id = 3 | Status 204 y activo = false (soft-delete) | Aprobada |
| BI-30 | I | DELETE /api/proveedores/{id} inexistente | id = 99 | Status 404 | Aprobada |
| BI-31 | I | GET /api/reportes/cierre-dia | Petición GET | Status 200 + corte del día | Aprobada |
| BI-32 | I | GET /api/reportes/existencias (estado) | Stock 100, 5 y 2 con mínimo 5 | Estados OK, BAJO, BAJO | Aprobada |
| BI-33 | I | GET /api/reportes/existencias (campos) | Un producto | Incluye nombre, código, stock y mínimo | Aprobada |
| BI-34 | I | GET /api/reportes/clientes | Petición GET | Status 200 + clientes activos | Aprobada |

## 4. Frontend — Pruebas Unitarias (Jasmine + Karma)

Resumen por archivo de pruebas (130 casos en total):

| ID | Tipo | Archivo de pruebas | Casos | Qué verifica | Estado |
|----|------|--------------------|-------|--------------|--------|
| FU-01 | U | `services/auth.spec.ts` | 5 | Login guarda token, logout, getUsuario | Aprobada |
| FU-02 | U | `services/producto.spec.ts` | 6 | GET, POST, PUT y DELETE de productos | Aprobada |
| FU-03 | U | `services/venta.spec.ts` | 3 | Procesar venta, buscar por id, listar | Aprobada |
| FU-04 | U | `services/cliente.spec.ts` | 3 | Listar, crear y actualizar clientes | Aprobada |
| FU-05 | U | `services/proveedor.spec.ts` | 4 | Listar, crear, actualizar y eliminar | Aprobada |
| FU-06 | U | `services/devolucion.spec.ts` | 2 | Listar y crear devoluciones | Aprobada |
| FU-07 | U | `services/caja.spec.ts` | 3 | Abrir, cerrar y corte de caja | Aprobada |
| FU-08 | U | `services/reporte.spec.ts` | 3 | Cierre del día, existencias, clientes | Aprobada |
| FU-09 | U | `guards/auth-guard.spec.ts` | 2 | Permite acceso con sesión; redirige al login sin sesión | Aprobada |
| FU-10 | U | `interceptors/auth.interceptor.spec.ts` | 2 | Agrega el header Bearer solo cuando hay token | Aprobada |
| FU-11 | U | `pages/login/login.spec.ts` | 4 | Validación de campos, login válido e inválido | Aprobada |
| FU-12 | U | `pages/dashboard/dashboard.spec.ts` | 5 | Carga de usuario, menú, logout y navegación | Aprobada |
| FU-13 | U | `pages/productos/productos.spec.ts` | 16 | CRUD de productos, filtros, formulario, errores | Aprobada |
| FU-14 | U | `pages/venta/venta.spec.ts` | 16 | Carrito, subtotales, total, cobro, errores de stock | Aprobada |
| FU-15 | U | `pages/factura/factura.spec.ts` | 6 | Carga de factura, ids inválidos, errores, impresión | Aprobada |
| FU-16 | U | `pages/clientes/clientes.spec.ts` | 12 | CRUD de clientes, filtros, validaciones | Aprobada |
| FU-17 | U | `pages/proveedores/proveedores.spec.ts` | 12 | CRUD de proveedores, filtros, confirmación | Aprobada |
| FU-18 | U | `pages/devoluciones/devoluciones.spec.ts` | 6 | Validaciones y registro de devoluciones | Aprobada |
| FU-19 | U | `pages/reportes/reportes.spec.ts` | 4 | Carga de cierre, existencias y clientes | Aprobada |
| FU-20 | U | `pages/caja/caja.spec.ts` | 6 | Abrir/cerrar caja, mensajes y errores | Aprobada |
| FU-21 | U | `pages/promociones/promociones.spec.ts` | 10 | Los 5 tipos de promoción y su vista previa | Aprobada |

## 5. Pruebas End-to-End de API (Postman + Newman)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|--------|
| E2E-01 | E2E | Login | admin / admin123 | Status 200 + token | Aprobada |
| E2E-02 | E2E | Crear producto | Producto "E2E001" + token | Status 200 + producto con id | Aprobada |
| E2E-03 | E2E | Listar productos | Token | Status 200 + lista contiene "E2E001" | Aprobada |
| E2E-04 | E2E | Eliminar producto | id del producto creado | Status 204 | Aprobada |

---

## Resumen

| Categoría | Cantidad | Resultado |
|-----------|----------|-----------|
| Unitarias backend (servicios y seguridad) | 45 | Todas aprobadas |
| Integración backend (controllers) | 34 | Todas aprobadas |
| Unitarias frontend | 130 | Todas aprobadas |
| E2E (API) | 4 requests / 9 asserts | Todas aprobadas |
| **Total (JUnit + Jasmine)** | **209** | **100% aprobadas** |

Todas las pruebas se ejecutan automáticamente en el pipeline CI/CD en cada Pull
Request y push a la rama `main`.

# Matriz de Casos de Prueba

Proyecto: Las Casas del Escuintleco

Este documento registra los casos de prueba diseñados y ejecutados, con su
identificador, tipo, entrada, resultado esperado y resultado obtenido. Todas las
pruebas se ejecutan automáticamente en el pipeline CI/CD.

Leyenda de tipos: **U** = Unitaria · **I** = Integración · **E2E** = End-to-End

---

## 1. Pruebas Unitarias del Backend — ProductoService (JUnit + Mockito)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|----------|
| BU-01 | U | Listar productos activos | Repositorio con 2 productos activos | Devuelve lista de 2 productos | Aprobada |
| BU-02 | U | Buscar producto por id existente | id = 1 | Devuelve el producto "Fideos" | Aprobada |
| BU-03 | U | Buscar producto por id inexistente | id = 99 | Lanza excepción "no encontrado" | Aprobada |
| BU-04 | U | Guardar producto nuevo | Producto sin id | Guarda y asigna fecha de creación | Aprobada |
| BU-05 | U | Actualizar producto | id = 1 + datos nuevos | Devuelve producto con datos actualizados | Aprobada |
| BU-06 | U | Eliminar producto (soft-delete) | id = 1 | El producto queda con activo = false | Aprobada |

## 2. Pruebas Unitarias del Backend — VentaService (JUnit + Mockito)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|----------|
| BU-07 | U | Calcular subtotal y total | Venta de 5 unidades a Q8.00 | subtotal = Q40.00, total = Q40.00 | Aprobada |
| BU-08 | U | Descontar stock al vender | Producto con stock 100, vende 10 | Stock queda en 90 | Aprobada |
| BU-09 | U | Stock insuficiente | Producto con stock 3, vende 10 | Lanza excepción "Stock insuficiente" | Aprobada |
| BU-10 | U | Usuario inexistente en venta | username = "fantasma" | Lanza excepción "Usuario no encontrado" | Aprobada |
| BU-11 | U | Generar número de factura y QR | Venta válida | numeroFactura inicia con "FAC-" y genera QR | Aprobada |
| BU-12 | U | Buscar venta inexistente | id = 99 | Lanza excepción "no encontrada" | Aprobada |
| BU-13 | U | Listar todas las ventas | Repositorio con 1 venta | Devuelve lista de 1 venta | Aprobada |

## 3. Pruebas de Integración del Backend — Controllers (MockMvc)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|----------|
| BI-01 | I | GET /api/productos | Petición GET | Status 200 + lista con "PAS001" | Aprobada |
| BI-02 | I | GET /api/productos/{id} | GET id = 1 | Status 200 + producto "Fideos" | Aprobada |
| BI-03 | I | POST /api/productos | Producto nuevo en JSON | Status 200 + producto creado con id | Aprobada |
| BI-04 | I | PUT /api/productos/{id} | PUT id = 1 + datos | Status 200 + producto actualizado | Aprobada |
| BI-05 | I | DELETE /api/productos/{id} | DELETE id = 1 | Status 204 (sin contenido) | Aprobada |
| BI-06 | I | POST /api/auth/login | Credenciales válidas | Status 200 + token JWT | Aprobada |

## 4. Pruebas Unitarias del Frontend — Servicios y Componentes (Jasmine)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|----------|
| FU-01 | U | Crear AuthService | — | El servicio se instancia | Aprobada |
| FU-02 | U | Login guarda token | Respuesta con token | Token guardado en localStorage | Aprobada |
| FU-03 | U | Logout limpia token | Token en localStorage | Token eliminado, isLoggedIn = false | Aprobada |
| FU-04 | U | getUsuario con datos | Usuario en localStorage | Devuelve el usuario | Aprobada |
| FU-05 | U | getUsuario sin datos | localStorage vacío | Devuelve null | Aprobada |
| FU-06 | U | Crear ProductoService | — | El servicio se instancia | Aprobada |
| FU-07 | U | Listar productos (GET) | Petición listar | GET a /api/productos, devuelve lista | Aprobada |
| FU-08 | U | Buscar por id (GET) | id = 1 | GET a /api/productos/1 | Aprobada |
| FU-09 | U | Crear producto (POST) | Producto | POST a /api/productos | Aprobada |
| FU-10 | U | Actualizar producto (PUT) | id = 1 + producto | PUT a /api/productos/1 | Aprobada |
| FU-11 | U | Eliminar producto (DELETE) | id = 1 | DELETE a /api/productos/1 | Aprobada |
| FU-12 | U | Crear LoginComponent | — | El componente se instancia | Aprobada |
| FU-13 | U | Validar campos vacíos | usuario y contraseña vacíos | Muestra error, no llama al servicio | Aprobada |
| FU-14 | U | Login con credenciales válidas | admin / admin123 | Invoca authService.login | Aprobada |
| FU-15 | U | Login fallido | credenciales inválidas | Muestra "Usuario o contraseña incorrectos" | Aprobada |

## 5. Pruebas End-to-End de API (Postman + Newman)

| ID | Tipo | Descripción | Entrada | Resultado esperado | Estado |
|----|------|-------------|---------|--------------------|----------|
| E2E-01 | E2E | Login | admin / admin123 | Status 200 + token | Aprobada |
| E2E-02 | E2E | Crear producto | Producto "E2E001" + token | Status 200 + producto con id | Aprobada |
| E2E-03 | E2E | Listar productos | Token | Status 200 + lista contiene "E2E001" | Aprobada |
| E2E-04 | E2E | Eliminar producto | id del producto creado | Status 204 | Aprobada |

---

## Resumen

| Categoría | Cantidad | Resultado |
|-----------|----------|-----------|
| Unitarias backend | 13 | Todas aprobadas |
| Integración backend | 6 | Todas aprobadas |
| Unitarias frontend | 15 | Todas aprobadas |
| E2E (API) | 4 asserts / 1 flujo | Todas aprobadas |
| **Total** | **38 verificaciones** | **100% aprobadas** |

Todas las pruebas se ejecutan automáticamente en el pipeline CI/CD en cada Pull
Request y push a la rama `main`.

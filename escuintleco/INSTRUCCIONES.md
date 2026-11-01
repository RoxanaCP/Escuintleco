# Las Casas del Escuintleco — Instrucciones de Instalación

## Requisitos
- Java 21, Maven 3.9, Node.js 24, Angular CLI 22, MySQL 8

---

## 1. Base de Datos

Abre MySQL Workbench y ejecuta el script:
```
escuintleco/database/escuintleco_db.sql
```

O desde CMD (si tienes mysql en PATH):
```
mysql -u root -p < database/escuintleco_db.sql
```

---

## 2. Backend (Spring Boot)

### Configurar contraseña de MySQL
Edita el archivo:
```
backend/src/main/resources/application.properties
```
Cambia estas líneas con tu usuario/contraseña de MySQL:
```
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD_AQUI
```

### Ejecutar el backend
Abre CMD en la carpeta `escuintleco/backend` y ejecuta:
```
mvn spring-boot:run
```
El backend corre en: http://localhost:8080

---

## 3. Frontend (Angular)

Abre OTRO CMD en la carpeta `escuintleco/frontend` y ejecuta:
```
ng serve
```
El frontend corre en: http://localhost:4200

---

## 4. Usuarios del Sistema

| Usuario  | Contraseña | Rol   |
|----------|-----------|-------|
| admin    | password  | ADMIN |
| cajero1  | cajero123 | CAJERO|

> Nota: Los passwords en la BD están encriptados con BCrypt.
> Si quieres cambiar el password, genera uno nuevo en: https://bcrypt-generator.com/

---

## Módulos Funcionales
- Login (autenticación JWT)
- Catálogo de Productos (CRUD completo)
- Despacho/Venta (carrito de compra)
- Facturación + Código QR

## Módulos Vista
- Catálogo de Clientes
- Catálogo de Proveedores
- Devoluciones
- Reportes
- Apertura/Cierre de Caja

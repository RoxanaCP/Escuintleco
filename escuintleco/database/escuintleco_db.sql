-- ============================================
-- BASE DE DATOS: LAS CASAS DEL ESCUINTLECO
-- ============================================

CREATE DATABASE IF NOT EXISTS escuintleco_db;
USE escuintleco_db;

-- ============================================
-- TABLA: usuarios (Login)
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'CAJERO',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);

-- ============================================
-- TABLA: proveedores
-- ============================================
CREATE TABLE IF NOT EXISTS proveedores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    precio_compra DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 5,
    categoria_id BIGINT,
    proveedor_id BIGINT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    nit VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- ============================================
-- TABLA: ventas (Facturación)
-- ============================================
CREATE TABLE IF NOT EXISTS ventas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_factura VARCHAR(20) NOT NULL UNIQUE,
    cliente_id BIGINT,
    usuario_id BIGINT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    descuento DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    forma_pago VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
    estado VARCHAR(20) NOT NULL DEFAULT 'PAGADA',
    qr_code TEXT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- TABLA: detalle_venta
-- ============================================
CREATE TABLE IF NOT EXISTS detalle_venta (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    venta_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- ============================================
-- TABLA: apertura_caja
-- ============================================
CREATE TABLE IF NOT EXISTS apertura_caja (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    monto_apertura DECIMAL(10,2) NOT NULL,
    monto_cierre DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'ABIERTA',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Categorías de productos
INSERT INTO categorias (nombre, descripcion) VALUES
('Pastas', 'Fideos, Corbatitas, Espagueti, etc.'),
('Productos Cárnicos', 'Pollo y Carne de Cerdo'),
('Embutidos', 'Jamones, Longanizas, etc.'),
('Lácteos', 'Crema, Queso, Leche, etc.'),
('Golosinas', 'Dulces, Chocolates, etc.'),
('Aguas Gaseosas', 'Gaseosas y refrescos'),
('Carbonatados', 'Gatorade, Revive, etc.');

-- Usuario administrador (password: admin123)
INSERT INTO usuarios (username, password, nombre, rol) VALUES
('admin', '$2b$10$1axg/vtcvHfjnYX.RSUeYer6D.laYM8/aXpSh9rCAR1gzI0bj3tJ.', 'Administrador', 'ADMIN'),
('cajero1', '$2b$10$jO5QeXjJ/.wT6jzRxMK0fOkJU3gdrJEnQGy.lUIAcKjpNBWmJZFW6', 'Cajero Principal', 'CAJERO');

-- Proveedor de ejemplo
INSERT INTO proveedores (nombre, telefono, email, direccion) VALUES
('Distribuidora Guatemala', '22345678', 'info@distguate.com', 'Zona 1, Guatemala'),
('Carnes del Norte', '55667788', 'ventas@carnesnorte.com', 'Zona 5, Guatemala'),
('Lácteos San José', '44556677', 'info@lacteossj.com', 'Zona 10, Guatemala');

-- Cliente genérico
INSERT INTO clientes (nombre, nit, telefono, direccion) VALUES
('Consumidor Final', 'CF', '00000000', 'Guatemala');

-- Productos de ejemplo
INSERT INTO productos (codigo, nombre, precio_compra, precio_venta, stock, categoria_id, proveedor_id) VALUES
('PAS001', 'Fideos Maruchan', 3.50, 5.00, 100, 1, 1),
('PAS002', 'Corbatitas Roma', 4.00, 6.00, 80, 1, 1),
('CAR001', 'Pechuga de Pollo (lb)', 12.00, 18.00, 50, 2, 2),
('CAR002', 'Costilla de Cerdo (lb)', 15.00, 22.00, 40, 2, 2),
('EMB001', 'Jamón Virginia 200g', 10.00, 15.00, 60, 3, 1),
('EMB002', 'Longaniza 250g', 8.00, 12.00, 45, 3, 2),
('LAC001', 'Crema Santa María 200ml', 6.00, 9.00, 70, 4, 3),
('LAC002', 'Queso Fresco 250g', 8.00, 12.00, 55, 4, 3),
('GOL001', 'Chocolate Snickers', 5.00, 8.00, 120, 5, 1),
('GOL002', 'Dulces Surtidos 100g', 3.00, 5.00, 200, 5, 1),
('GAS001', 'Coca Cola 500ml', 5.00, 8.00, 150, 6, 1),
('GAS002', 'Pepsi 500ml', 4.50, 7.00, 130, 6, 1),
('CAR003', 'Gatorade Azul 500ml', 8.00, 12.00, 90, 7, 1),
('CAR004', 'Revive 500ml', 7.00, 10.00, 85, 7, 1);

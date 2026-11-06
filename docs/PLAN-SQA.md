# Plan de Aseguramiento de la Calidad del Software (SQA Plan)

Proyecto: Las Casas del Escuintleco
Estándar de referencia: IEEE 730 (Software Quality Assurance Plans)
Versión: 1.0

---

## 1. Propósito

Este Plan de Aseguramiento de la Calidad del Software (SQA Plan) define las
actividades, estándares, herramientas y procedimientos que aseguran la calidad del
software del sistema de punto de venta "Las Casas del Escuintleco". La finalidad es
garantizar que toda modificación en el código pase por verificaciones automáticas de calidad
(pruebas, cobertura, análisis estático y quality gates) antes de ser aceptado en la
rama principal del repositorio.

Alcance: aplica al backend (Java 21 + Spring Boot 3.2.5), al frontend (Angular 22) y a
la base de datos MySQL 8 del proyecto.

---

## 2. Documentos de Referencia

- IEEE 730 — Standard for Software Quality Assurance Plans.
- Guía Técnica y Manual de Uso: `docs/GUIA-TECNICA.md`
- Reporte de Métricas: `docs/METRICAS.md`
- Workflow del pipeline: `.github/workflows/ci.yml`

---

## 3. Documentación

La documentación del proyecto se conserva en formato Markdown dentro del repositorio:
- Plan de SQA (este documento).
- Reporte de métricas antes/después.
- Guía técnica y manual de uso.
- Documentos de especificación (requisitos, diseño, tareas).

---

## 4. Estándares y Prácticas

### Estándares de código
- **Backend:** convenciones de Java y Spring Boot; análisis con SonarCloud.
- **Frontend:** reglas de ESLint para Angular/TypeScript (`eslint.config.js`).

### Prácticas de control de versiones
- Rama principal `main` protegida.
- Todo cambio entra mediante Pull Request.
- No se permite push directo a `main`.

---

## 5. Revisiones

### Revisión automatizada
El pipeline CI/CD ejecuta en cada Pull Request:
- Compilación (build).
- Pruebas unitarias, de integración y de regresión.
- Pruebas E2E de API.
- Análisis estático con SonarCloud.
- Evaluación del Quality Gate.

### Revisión manual
El responsable del merge examina el Pull Request y los resultados del pipeline antes de
aprobarlo.

---

## 6. Pruebas

| Tipo | Herramienta | Alcance |
|------|-------------|---------|
| Unitaria (backend) | JUnit 5 + Mockito | Capa de servicio, JwtUtil y JwtFilter |
| Integración (backend) | Spring Boot Test + MockMvc | Todos los controladores REST |
| Unitaria (frontend) | Jasmine + Karma | Servicios, guard, interceptor y componentes Angular |
| Regresión | Suites completas en CI | En cada PR y push a `main` |
| E2E | Postman + Newman | Flujo crítico: login + CRUD de producto |

Las pruebas se ejecutan automáticamente en el pipeline y también pueden correrse
localmente (ver la Guía Técnica).

---

## 7. Reporte de Problemas y Acciones Correctivas

- Los fallos del pipeline se reportan automáticamente en cada Pull Request de GitHub.
- Si una etapa falla, el merge permanece bloqueado hasta que se solucione.
- Los problemas de calidad detectados por SonarCloud se listan en el dashboard del
  proyecto en SonarCloud, con su severidad y ubicación.
- La gestión de deuda técnica se realiza revisando periódicamente los issues de
  SonarCloud y priorizando su corrección.

---

## 8. Herramientas

| Categoría | Herramienta |
|-----------|-------------|
| Control de versiones | Git + GitHub |
| CI/CD | GitHub Actions |
| Pruebas backend | JUnit 5, Mockito, Spring Boot Test (MockMvc) |
| Pruebas frontend | Jasmine, Karma |
| Pruebas E2E | Postman, Newman |
| Cobertura backend | JaCoCo |
| Cobertura frontend | Istanbul (vía Karma) |
| Análisis estático | SonarCloud, ESLint |
| Base de datos | MySQL 8 |

---

## 9. Métricas y Quality Gate

### Umbrales de cobertura
- **Backend:** mínimo **60%** de cobertura de línea (JaCoCo `check`).
- **Frontend:** mínimo **50%** de cobertura de línea (Karma `check`).

### Condiciones del Quality Gate
Un cambio se acepta únicamente si:
1. La compilación (build) es exitosa.
2. Todas las pruebas (unitarias, integración, regresión, E2E) pasan.
3. La cobertura cumple los umbrales mínimos definidos.
4. El Quality Gate de SonarCloud está en estado "Passed" (sin bugs ni
   vulnerabilidades por encima del umbral, y duplicación controlada).

Si cualquier condición no se cumple, el pipeline falla y la protección de rama
bloquea el merge del Pull Request.

### Métricas monitoreadas
- Cobertura de código (líneas, branches, funciones).
- Cantidad de problemas (bugs, code smells, vulnerabilidades) de SonarCloud.
- Porcentaje de duplicación de código.
- Resultado de las pruebas (aprobadas/fallidas).

---

## 10. Riesgos y Mitigaciones

Identificación de los riesgos de calidad más relevantes del proyecto y cómo se reducen.

| # | Riesgo | Impacto | Probabilidad | Mitigación |
|---|--------|---------|--------------|------------|
| R1 | Introducir una regresión (romper algo que funcionaba) | Alto | Media | El pipeline ejecuta todas las pruebas en cada cambio; si algo se rompe, el merge se bloquea |
| R2 | Bajar la cobertura de código al agregar código sin pruebas | Medio | Media | Umbrales obligatorios de cobertura (JaCoCo 60%, Istanbul 50%) que hacen fallar el pipeline |
| R3 | Acumulación de deuda técnica (code smells, bugs) | Medio | Alta | SonarCloud detecta y reporta los issues; el Quality Gate evalúa el código nuevo para no introducir más deuda |
| R4 | Subir código directo a `main` sin revisión | Alto | Baja | Protección de rama: push directo bloqueado, Pull Request obligatorio |
| R5 | Exposición de credenciales o secretos en el repositorio | Alto | Baja | Las credenciales se manejan como variables de entorno y secretos de GitHub (`SONAR_TOKEN`), no en el código |
| R6 | Fallo de la integración con SonarCloud (token o configuración) | Bajo | Media | El token está documentado en la guía técnica; el job `analyze` reporta el error claramente si falla |
| R7 | Dependencias desactualizadas o vulnerables | Medio | Media | SonarCloud y el análisis estático ayudan a detectar problemas; las versiones están fijadas en `pom.xml` y `package.json` |

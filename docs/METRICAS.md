# Reporte de Métricas de Calidad

Proyecto: Las Casas del Escuintleco
Stack: Java 21 + Spring Boot 3.2.5 (backend) · Angular 22 (frontend) · MySQL 8

Este documento registra las métricas de calidad del software antes y después
de la intervención de Aseguramiento de la Calidad (SQA): pruebas automatizadas,
cobertura de código, análisis estático y pipeline CI/CD.

---

## 1. Métricas ANTES de la intervención (línea base)

Medición realizada sobre el estado inicial del proyecto, previo a agregar pruebas,
cobertura y análisis estático.

| Métrica | Backend | Frontend |
|---------|---------|----------|
| Pruebas unitarias | 0 (no existen) | 0 (no existen) |
| Pruebas de integración | 0 (no existen) | — |
| Pruebas E2E | 0 (no existen) | — |
| Cobertura de código | 0% (sin medición) | 0% (sin medición) |
| Análisis estático (SonarCloud) | No configurado | No configurado |
| Linter (ESLint) | — | No configurado |
| Pipeline CI/CD | No existe | No existe |
| Quality Gate | No definido | No definido |
| Protección de rama | No configurada | No configurada |

### Observaciones de la línea base
- El comando `mvn test` reportaba "No tests to run": el backend compilaba pero no
  tenía ninguna prueba automatizada.
- El frontend no tenía pruebas escritas ni configuración de ejecución en CI.
- No había ninguna verificación automática de calidad al hacer cambios.

---

## 2. Métricas DESPUÉS de la intervención

Medición realizada tras implementar las pruebas, la cobertura, el análisis estático
y el pipeline CI/CD.

| Métrica | Backend | Frontend |
|---------|---------|----------|
| Pruebas unitarias | 45 (servicios, JwtUtil y JwtFilter) | 130 en total (servicios, guard, interceptor y componentes) |
| Pruebas de integración | 34 (todos los controllers REST, con MockMvc) | — |
| Pruebas E2E | 1 flujo (4 requests, 9 asserts) con Newman | — |
| Cobertura de líneas | 86% (medida sobre todo el backend, sin model, dto ni clase principal) | 97.81% |
| Cobertura de branches | — | 82.01% |
| Cobertura de funciones | — | 93.56% |
| Umbral de cobertura exigido | 60% sobre todo el backend (JaCoCo check) | 50% (Karma check) |
| Análisis estático (SonarCloud) | Configurado (Java) | Configurado (TypeScript) |
| Linter (ESLint) | — | Configurado (reporta violaciones) |
| Pipeline CI/CD | GitHub Actions (4 etapas) | GitHub Actions (4 etapas) |
| Quality Gate | Activo (qualitygate.wait) | Activo |
| Protección de rama | PR obligatorio + status checks | — |

### Notas
- Total de pruebas automatizadas: 209 (79 backend + 130 frontend) + 1 flujo E2E de 4 requests.
- El umbral del 60% de JaCoCo se aplica a todo el backend; la cobertura medida es 86%.
- En el frontend, los 21 archivos fuente están incluidos en el reporte de cobertura,
  por lo que el 97.81% refleja todo el código y no solo una parte.
- Las métricas de SonarCloud (code smells, bugs, duplicación) se obtienen al ejecutar
  el pipeline con el `SONAR_TOKEN` configurado; se registran en el dashboard de
  SonarCloud del proyecto.

---

## 3. Comparación y Análisis de Impacto

| Dimensión | Antes | Después |
|-----------|-------|---------|
| Pruebas automatizadas | 0 | 209 (79 BE + 130 FE) + 1 flujo E2E |
| Cobertura medida | Ninguna | Backend 86% y frontend 97.81%, con umbral obligatorio |
| Análisis estático | Ninguno | SonarCloud + ESLint |
| Verificación en cada cambio | Manual / inexistente | Automática vía pipeline |
| Protección de la rama main | Ninguna | PR obligatorio + quality gate |

### Impacto de la intervención
Antes de la intervención, el proyecto no tenía ninguna red de seguridad: cualquier
cambio podía romper funcionalidad sin que nadie se enterara, y no había forma objetiva
de medir la calidad del código.

Después de la intervención:
- Cada cambio pasa automáticamente por build, pruebas, análisis estático y reporte.
- Las reglas de negocio (cálculo de totales, control de stock, devoluciones, cierre\n  de caja) y la seguridad (JWT) quedaron cubiertas por pruebas que se ejecutan en cada cambio, protegiendo contra regresiones.
- El Quality Gate impide que entre a `main` código que no cumpla los umbrales de
  cobertura o que introduzca problemas detectados por SonarCloud.
- La protección de rama garantiza revisión y validación antes de cada merge.

En resumen, el proyecto pasó de cero aseguramiento de calidad automatizado a un
flujo CI/CD completo con controles de SQA que se aplican de forma consistente y
objetiva en cada cambio.

# Reporte de Mejora de Calidad

Proyecto: Las Casas del Escuintleco

Este documento presenta la comparativa de métricas de calidad antes y después de
la intervención de Aseguramiento de la Calidad (SQA), junto con el análisis del
impacto obtenido.

- Estado inicial detallado: ver `LINEA-BASE-CALIDAD.md`
- Métricas completas: ver `METRICAS.md`

---

## 1. Comparativa General (Antes vs Después)

| Dimensión | Antes | Después |
|-----------|-------|---------|
| Pruebas automatizadas | 0 | 209 pruebas (79 backend + 130 frontend) + 1 flujo E2E |
| Cobertura de código | 0% (sin medir) | Backend 86% y frontend 97.81%, con umbral obligatorio |
| Análisis estático | Ninguno | SonarCloud + ESLint |
| Verificación en cada cambio | Manual / inexistente | Automática vía pipeline CI/CD |
| Pipeline CI/CD | No existía | 4 etapas (build, test, analyze, report) |
| Quality Gate | No definido | Activo (bloquea si no se cumple) |
| Protección de rama principal | Ninguna | PR obligatorio + status checks |

---

## 2. Comparativa de Cobertura

| Componente | Cobertura Antes | Cobertura Después | Umbral exigido |
|------------|-----------------|-------------------|----------------|
| Backend (líneas, todo el proyecto) | 0% | 86% | 60% |
| Frontend (líneas) | 0% | 97.81% | 50% |
| Frontend (branches) | 0% | 82.01% | 40% |
| Frontend (funciones) | 0% | 93.56% | 50% |

La cobertura del backend se mide sobre todo el proyecto, excluyendo únicamente las
clases sin lógica (`model`, `dto` y la clase principal). La del frontend incluye los
21 archivos fuente de la aplicación.

SonarCloud, que combina backend y frontend sin exclusiones, reporta una cobertura
global del proyecto de **51.3%**. Además registra **67 issues** de calidad (deuda
técnica heredada), **0.0%** de duplicación y una calificación de seguridad **A**.
El Quality Gate está en estado **Passed**.

### Cobertura del backend por paquete

| Paquete | Cobertura de líneas |
|---------|---------------------|
| controller | 96% |
| service | 94% |
| security | 54% (JwtUtil y JwtFilter cubiertos; SecurityConfig sin pruebas) |

### Representación visual (cobertura de líneas)

```
Backend (todo el proyecto)
Antes:   [                    ] 0%
Despues: [#################   ] 86%

Frontend (todo el proyecto)
Antes:   [                    ] 0%
Despues: [###################-] 98%
```

---

## 3. Comparativa de Pruebas

| Tipo de prueba | Antes | Después |
|----------------|-------|---------|
| Unitarias backend (services y seguridad) | 0 | 45 |
| Integración backend (controllers) | 0 | 34 |
| Frontend (servicios, guard, interceptor y componentes) | 0 | 130 |
| E2E (API) | 0 | 4 requests / 9 asserts |
| **Total de pruebas JUnit y Jasmine** | **0** | **209** |

```
Cantidad de pruebas automatizadas
Antes:   [ ] 0
Despues: [##################################################] 209
```

---

## 4. Análisis del Impacto

Antes de la intervención, el proyecto no contaba con ninguna red de seguridad de
calidad: cualquier cambio podía romper funcionalidad existente sin que se detectara,
y no había forma objetiva de medir la calidad del código.

Después de la intervención, se logró:

1. **Detección automática de regresiones:** las 209 pruebas corren en cada cambio,
   protegiendo la funcionalidad existente.
2. **Cobertura medida y obligatoria:** las reglas de negocio (cálculo de totales,
   control de stock, devoluciones, cierre de caja) y la seguridad (JWT) quedaron
   cubiertas, y se exige un mínimo de cobertura sobre todo el proyecto.
3. **Calidad de código visible:** SonarCloud y ESLint detectan y reportan los
   problemas de calidad, permitiendo gestionar la deuda técnica.
4. **Control de cambios:** la protección de rama y el Quality Gate impiden que entre
   a `main` código que no cumpla los estándares definidos.
5. **Un defecto real corregido:** al escribir las pruebas de `JwtUtil` se detectó que
   `validateToken` lanzaba una excepción con un token vacío en lugar de devolver
   `false`. Se corrigió, lo que demuestra el valor de las pruebas automatizadas.

### Conclusión

El proyecto pasó de cero aseguramiento de calidad automatizado a un flujo CI/CD
completo con controles de SQA que se aplican de forma consistente y objetiva en cada
cambio. La mejora es medible: de 0 a 209 pruebas, de 0% a 86% (backend) y 97.81%
(frontend) de cobertura, y de ninguna verificación automática a un pipeline de 4
etapas con quality gates.

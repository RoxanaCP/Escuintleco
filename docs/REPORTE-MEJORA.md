# Reporte de Mejora de Calidad

Proyecto: Las Casas del Escuintleco

Este documento presenta la comparativa de métricas de calidad antes y después de
la intervención de Aseguramiento de la Calidad (SQA), junto con el análisis del
impacto obtenido.

- Estado inicial detallado: ver `Linea-Base-Calidad.md`
- Métricas completas: ver `METRICAS.md`

---

## 1. Comparativa General (Antes vs Después)

| Dimensión | Antes | Después |
|-----------|-------|---------|
| Pruebas automatizadas | 0 | 38 verificaciones (19 BE + 15 FE + 4 E2E) |
| Cobertura de código | 0% (sin medir) | Backend y frontend con umbral obligatorio |
| Análisis estático | Ninguno | SonarCloud + ESLint |
| Verificación en cada cambio | Manual / inexistente | Automática vía pipeline CI/CD |
| Pipeline CI/CD | No existía | 4 etapas (build, test, analyze, report) |
| Quality Gate | No definido | Activo (bloquea si no se cumple) |
| Protección de rama principal | Ninguna | PR obligatorio + status checks |

---

## 2. Comparativa de Cobertura

| Componente | Cobertura Antes | Cobertura Después | Umbral exigido |
|------------|-----------------|-------------------|----------------|
| Backend (ProductoService) | 0% | 81% | 60% |
| Backend (VentaService) | 0% | 96% | 60% |
| Frontend (líneas) | 0% | 95.12% | 50% |
| Frontend (branches) | 0% | 100% | 40% |
| Frontend (funciones) | 0% | 89.47% | 50% |

### Representación visual (cobertura de líneas)

```
Backend ProductoService
Antes:   [                    ] 0%
Despues: [################    ] 81%

Backend VentaService
Antes:   [                    ] 0%
Despues: [###################-] 96%

Frontend
Antes:   [                    ] 0%
Despues: [###################-] 95%
```

---

## 3. Comparativa de Pruebas

| Tipo de prueba | Antes | Después |
|----------------|-------|---------|
| Unitarias backend | 0 | 13 |
| Integración backend | 0 | 6 |
| Unitarias frontend | 0 | 15 |
| E2E (API) | 0 | 4 |
| **Total** | **0** | **38** |

```
Cantidad de pruebas automatizadas
Antes:   [ ] 0
Despues: [##################################] 38
```

---

## 4. Análisis del Impacto

Antes de la intervención, el proyecto no contaba con ninguna red de seguridad de
calidad: cualquier cambio podía romper funcionalidad existente sin que se detectara,
y no había forma objetiva de medir la calidad del código.

Después de la intervención, se logró:

1. **Detección automática de regresiones:** las 38 verificaciones corren en cada
   cambio, protegiendo la funcionalidad existente.
2. **Cobertura medida y obligatoria:** las reglas de negocio críticas (cálculo de
   totales, control de stock) quedaron cubiertas y se exige un mínimo de cobertura.
3. **Calidad de código visible:** SonarCloud y ESLint detectan y reportan los
   problemas de calidad, permitiendo gestionar la deuda técnica.
4. **Control de cambios:** la protección de rama y el Quality Gate impiden que entre
   a `main` código que no cumpla los estándares definidos.

### Conclusión

El proyecto pasó de cero aseguramiento de calidad automatizado a un flujo CI/CD
completo con controles de SQA que se aplican de forma consistente y objetiva en cada
cambio. La mejora es medible: de 0 a 38 pruebas, de 0% a una cobertura alta en los
módulos críticos, y de ninguna verificación automática a un pipeline de 4 etapas con
quality gates.

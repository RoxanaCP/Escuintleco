# Línea Base de Calidad

Proyecto: Las Casas del Escuintleco
Stack: Java 21 + Spring Boot 3.2.5 (backend) · Angular 22 (frontend) · MySQL 8

Este documento registra las métricas iniciales del código antes de la intervención
de Aseguramiento de la Calidad (SQA). Representa el punto de partida contra el cual se
compara el estado posterior (ver `METRICAS.md`).

---

## 1. Contexto

Antes de la intervención, el proyecto era una aplicación full-stack funcional con
operaciones CRUD, pero sin ningún control automatizado de calidad:

- No existían pruebas automatizadas.
- No se medía la cobertura de código.
- No había análisis estático configurado.
- No existía un pipeline de CI/CD.
- La rama principal no estaba protegida.

---

## 2. Métricas Iniciales

| Métrica | Backend | Frontend |
|---------|---------|----------|
| Pruebas unitarias | 0 | 0 |
| Pruebas de integración | 0 | — |
| Pruebas E2E | 0 | — |
| Cobertura de código | 0% (sin medición) | 0% (sin medición) |
| Análisis estático (SonarCloud) | No configurado | No configurado |
| Linter (ESLint) | — | No configurado |
| Issues de calidad detectados | Sin medir | Sin medir |
| Duplicación de código | Sin medir | Sin medir |
| Pipeline CI/CD | No existe | No existe |
| Quality Gate | No definido | No definido |
| Protección de rama principal | No configurada | No configurada |

---

## 3. Evidencia de la Línea Base

- Al ejecutar `mvn test` en el backend, el resultado era "No tests to run":
  el proyecto compilaba correctamente pero no contenía ninguna prueba automatizada.
- El frontend tenía la configuración por defecto de Angular (Jasmine/Karma) pero
  sin archivos de prueba (`*.spec.ts`) escritos ni configuración de ejecución
  en modo CI.
- No existía el archivo `.github/workflows/ci.yml` ni ninguna integración con
  SonarCloud.

---

## 4. Conclusión de la Línea Base

El proyecto partía de un estado de cero aseguramiento de calidad automatizado.
Cualquier cambio en el código podía introducir errores o romper funcionalidad
existente sin ninguna detección automática, y no existía forma objetiva de medir la
calidad del software.

Esta línea base es el punto de referencia para evaluar el impacto de la intervención
de SQA, cuya comparación completa se documenta en `METRICAS.md`.

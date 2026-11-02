# Las Casas del Escuintleco

Sistema de punto de venta full-stack con pipeline CI/CD y controles de
Aseguramiento de la Calidad del Software (SQA).

## Stack

- **Backend:** Java 21 + Spring Boot 3.2.5 + MySQL 8
- **Frontend:** Angular 22
- **CI/CD:** GitHub Actions
- **Análisis estático:** SonarCloud + ESLint
- **Pruebas:** JUnit + Mockito (backend), Jasmine + Karma (frontend), Postman/Newman (E2E)
- **Cobertura:** JaCoCo (backend), Istanbul (frontend)

## Documentación

- Plan de SQA: `docs/PLAN-SQA.md`
- Reporte de métricas: `docs/METRICAS.md`
- Guía técnica y manual de uso: `docs/GUIA-TECNICA.md`

## Pipeline

El pipeline se ejecuta automáticamente en cada Pull Request y push a `main`,
con 4 etapas: build, test, analyze y report.

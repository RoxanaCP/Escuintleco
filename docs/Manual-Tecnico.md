# Manual Técnico

Proyecto: Las Casas del Escuintleco

Este manual describe la arquitectura del pipeline CI/CD, las decisiones técnicas
tomadas y una guía de mantenimiento. Para el uso diario (correr pruebas, enviar un
Pull Request) ver `GUIA-TECNICA.md`.

---

## 1. Arquitectura del Pipeline

### 1.1 Visión general

El pipeline está definido en `.github/workflows/ci.yml` y se ejecuta en GitHub
Actions. Se dispara en dos eventos:

- `pull_request` hacia `main`
- `push` a `main`

Cada job corre en su propia máquina virtual (runner `ubuntu-latest`) que se crea
limpia al iniciar y se destruye al terminar. Los jobs no comparten disco: la
información entre ellos se pasa con artefactos (`upload-artifact` /
`download-artifact`) y con el resultado de `needs`.

### 1.2 Jobs y dependencias

```
                      build
                        |
        +---------------+---------------+
        |               |               |
  test-backend    test-frontend         e2e
        |               |               |
        +-------+-------+               |
                |                       |
             analyze                    |
                |                       |
                +-----------+-----------+
                            |
                         report
```

| Job | Etapa | Depende de | Qué hace |
|-----|-------|------------|----------|
| `build` | Build | — | Compila el backend con Maven y construye el frontend con Angular CLI |
| `test-backend` | Test | build | Ejecuta pruebas unitarias y de integración con `mvn verify`; genera el reporte JaCoCo; usa un servicio MySQL |
| `test-frontend` | Test | build | Ejecuta ESLint y las pruebas Jasmine/Karma en modo headless; genera el reporte LCOV |
| `e2e` | Test | build | Levanta MySQL y el backend, y ejecuta la colección Postman con Newman |
| `analyze` | Analyze | test-backend, test-frontend | Regenera la cobertura y ejecuta el análisis de SonarCloud esperando el Quality Gate |
| `report` | Report | analyze, e2e | Descarga los reportes de cobertura y escribe un resumen del run |

### 1.3 Quality gates en capas

El pipeline rechaza código en tres niveles:

1. **Pruebas:** si cualquier prueba falla, el job falla.
2. **Cobertura:** JaCoCo (`check` en `pom.xml`) y Karma (`check` en `karma.conf.js`)
   hacen fallar el job si no se alcanza el umbral.
3. **Quality Gate de SonarCloud:** la opción `sonar.qualitygate.wait=true` hace que
   el job `analyze` falle si SonarCloud marca el gate como fallido.

### 1.4 Protección de rama

Un ruleset de GitHub sobre `main` exige Pull Request y que pasen los cinco status
checks: `Build (backend + frontend)`, `Test Backend`, `Test Frontend`,
`E2E (Postman/Newman)` y `Analyze (SonarCloud + Quality Gate)`. Un push directo a
`main` es rechazado por GitHub.

### 1.5 Mapa de archivos

| Archivo | Función |
|---------|---------|
| `.github/workflows/ci.yml` | Definición del pipeline |
| `sonar-project.properties` | Configuración del análisis de SonarCloud |
| `escuintleco/backend/pom.xml` | Dependencias, plugin JaCoCo y umbral de cobertura del backend |
| `escuintleco/backend/src/test/` | Pruebas del backend |
| `escuintleco/backend/src/test/resources/application-ci.properties` | Perfil de Spring para el entorno de CI |
| `escuintleco/frontend/karma.conf.js` | Karma, reporte de cobertura y umbral del frontend |
| `escuintleco/frontend/eslint.config.js` | Reglas del linter |
| `escuintleco/frontend/.prettierrc` | Formato de código |
| `escuintleco/e2e/escuintleco.postman_collection.json` | Pruebas end-to-end de API |

---

## 2. Decisiones Técnicas

| # | Decisión | Justificación |
|---|----------|---------------|
| D1 | Usar las herramientas nativas de Java y Angular (JUnit, Mockito, JaCoCo, Jasmine, Karma) en lugar de las del stack sugerido en el enunciado (Jest, Supertest, Istanbul/nyc) | El proyecto existente es Spring Boot + Angular. El enunciado permite variantes de stack siempre que se mantengan los conceptos de SQA |
| D2 | GitHub Actions como motor de CI/CD | El repositorio está en GitHub; no requiere servidores propios |
| D3 | SonarCloud en lugar de SonarQube autohospedado | Evita mantener un servidor; soporta Java y TypeScript; es gratuito para repositorios públicos |
| D4 | Postman/Newman para E2E | Más simple de escribir y ejecutar en CI que Selenium o Cypress; el enunciado lo permite |
| D5 | Un contenedor de servicio MySQL en los jobs que lo necesitan | Pruebas realistas sin infraestructura externa; el contenedor se destruye al terminar el job |
| D6 | Jobs separados con `needs` | Cada etapa es observable por separado; `test-backend`, `test-frontend` y `e2e` corren en paralelo, lo que acorta el tiempo total |
| D7 | Regenerar la cobertura dentro del job `analyze` | Los jobs no comparten disco, y SonarCloud necesita los reportes en la misma máquina donde se ejecuta el escaneo |
| D8 | ESLint con `continue-on-error: true` | El código existente tiene deuda técnica que el linter detecta; se reporta sin bloquear el pipeline. SonarCloud evalúa el código nuevo |
| D9 | Umbral de cobertura en 60% (backend) y 50% (frontend) | Valores alcanzables para un código que partía sin pruebas, y aun así exigentes |
| D10 | Credenciales por variable de entorno (`DB_USERNAME`, `DB_PASSWORD`) y secretos de GitHub (`SONAR_TOKEN`) | Evita dejar contraseñas en el repositorio |
| D11 | Node.js 22 en el pipeline | Angular CLI 22 exige Node 22.22 o superior; con Node 20 el build falla |
| D12 | `npm ci --legacy-peer-deps` | Hay un conflicto de peer dependencies entre versiones de paquetes de Angular que se resuelve con esta opción |

### Limitaciones conocidas

- La cobertura de pruebas no abarca todo el proyecto: se priorizaron los módulos de
  mayor riesgo (ventas, productos, autenticación). Los demás módulos están
  identificados como trabajo pendiente.
- El Quality Gate de SonarCloud evalúa por defecto el código nuevo, por lo que los
  issues preexistentes (deuda técnica heredada) no bloquean el pipeline; quedan
  visibles en el dashboard de SonarCloud.
- El linter (ESLint) corre sin bloquear el pipeline por el motivo descrito en D8.

---

## 3. Guía de Mantenimiento

### 3.1 Agregar una prueba nueva

- **Backend:** crear una clase `*Test.java` en `escuintleco/backend/src/test/java/`
  siguiendo el paquete de la clase probada. `mvn verify` la detecta automáticamente.
- **Frontend:** crear un archivo `*.spec.ts` junto al archivo que se prueba.
  `npm run test:ci` lo detecta automáticamente.
- **E2E:** agregar una petición con sus aserciones a la colección de Postman en
  `escuintleco/e2e/`.

### 3.2 Cambiar un umbral de cobertura

- **Backend:** editar `<minimum>0.60</minimum>` en el plugin JaCoCo de `pom.xml`.
- **Frontend:** editar los valores de `check.global` en `karma.conf.js`.
- Documentar el cambio en `PLAN-SQA.md`, sección de métricas.

### 3.3 Actualizar versiones

- **Java / Node:** cambiar `java-version` y `node-version` en `ci.yml`, en todos los
  jobs donde aparezcan.
- **Actions:** las versiones (`@v4`) están fijadas; actualizarlas revisando las notas
  de cada release.
- **Dependencias del backend:** editar `pom.xml`. **Del frontend:** editar
  `package.json` y regenerar `package-lock.json`.

### 3.4 Renovar el token de SonarCloud

1. En SonarCloud: My Account > Security, revocar el token anterior y generar uno nuevo.
2. En GitHub: Settings > Secrets and variables > Actions, actualizar el secreto
   `SONAR_TOKEN` con el valor nuevo.

### 3.5 Cambiar los status checks requeridos

Si se renombra un job en `ci.yml` (campo `name:`), el nombre del check cambia y el
ruleset de `main` deja de reconocerlo: el PR quedará en "Expected - Waiting for
status to be reported". Actualizar los checks requeridos en Settings > Rules >
Rulesets para que coincidan con los nombres reales.

### 3.6 Diagnóstico de fallos comunes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `Angular CLI requires a minimum Node.js version` | Versión de Node del runner demasiado baja | Subir `node-version` en `ci.yml` |
| `Not authorized or organization not found` en `analyze` | `sonar.organization` o `sonar.projectKey` incorrectos, o `SONAR_TOKEN` ausente | Revisar `sonar-project.properties` y el secreto |
| `Invalid workflow file` | Error de sintaxis en `ci.yml` | Corregir el YAML indicado en el mensaje |
| PR bloqueado en "Expected - Waiting for status" | Los checks requeridos no coinciden con los nombres de los jobs | Ver sección 3.5 |
| `Rule violated ... lines covered ratio` | La cobertura bajó del umbral | Agregar pruebas para el código nuevo |
| `push declined due to repository rule violations` | Intento de push directo a `main` | Crear una rama y abrir un Pull Request |

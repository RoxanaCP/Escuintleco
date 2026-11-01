# Guía Técnica y Manual de Uso

Proyecto: Las Casas del Escuintleco
Pipeline CI/CD con controles de Aseguramiento de la Calidad (SQA)

---

## 1. Configuración de SonarCloud

SonarCloud realiza el análisis estático del código (Java y TypeScript) y evalúa el
Quality Gate. Pasos para configurarlo:

### 1.1 Crear el proyecto en SonarCloud
1. Entrar a https://sonarcloud.io e iniciar sesión con la cuenta de GitHub.
2. Clic en **+ → Analyze new project** y seleccionar el repositorio.
3. Elegir el método de análisis **GitHub Actions**.
4. Anotar la **Organization Key** y la **Project Key** que asigna SonarCloud.

### 1.2 Actualizar `sonar-project.properties`
En la raíz del repositorio, editar el archivo `sonar-project.properties` y reemplazar:
- `sonar.organization` → la Organization Key de SonarCloud
- `sonar.projectKey` → la Project Key de SonarCloud

### 1.3 Configurar el secreto en GitHub
El pipeline necesita un token para autenticarse con SonarCloud:
1. En SonarCloud: **My Account → Security → Generate Token** y copiar el token.
2. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
3. Crear un secreto con nombre exacto **`SONAR_TOKEN`** y pegar el token como valor.

> El workflow referencia este secreto como `${{ secrets.SONAR_TOKEN }}`. Sin él, el
> job `analyze` falla.

---

## 2. Cómo ejecutar las pruebas localmente

### Backend (Java + Maven)
```
cd escuintleco/backend
mvn verify
```
- `mvn verify` ejecuta todas las pruebas (unitarias + integración) y genera el reporte
  de cobertura JaCoCo en `target/site/jacoco/`.
- El build falla si la cobertura de línea está por debajo del 60%.

### Frontend (Angular + Karma)
```
cd escuintleco/frontend
npm ci
npm run test:ci
```
- Ejecuta las pruebas en Chrome headless, una sola vez, con cobertura.
- Genera el reporte LCOV en `coverage/frontend/`.
- Falla si la cobertura de línea está por debajo del 50%.

### Linting del frontend
```
cd escuintleco/frontend
npm run lint
```

---

## 3. Etapas del Pipeline

El pipeline está definido en `.github/workflows/ci.yml` y se **dispara automáticamente**
en dos eventos:
- Al abrir o actualizar un **Pull Request** hacia `main`.
- Al hacer **push** a `main`.

Consta de las siguientes etapas (jobs):

| Etapa | Job | Qué hace |
|-------|-----|----------|
| 1. Build | `build` | Compila el backend con Maven y construye el frontend con Angular CLI |
| 2. Test Backend | `test-backend` | Ejecuta pruebas + cobertura JaCoCo (con MySQL) y sube el reporte |
| 2. Test Frontend | `test-frontend` | Ejecuta pruebas headless + cobertura Istanbul y sube el LCOV |
| 2. E2E | `e2e` | Levanta backend + MySQL y corre las pruebas Newman |
| 3. Analyze | `analyze` | Escaneo de SonarCloud y evaluación del Quality Gate |
| 4. Report | `report` | Agrega los artefactos de cobertura y escribe un resumen del run |

### Dependencias entre etapas
- `test-backend`, `test-frontend` y `e2e` dependen de `build` (si el build falla, se omiten).
- `analyze` depende de `test-backend` y `test-frontend`.
- `report` depende de `analyze` y `e2e`.

Si cualquier etapa falla, el pipeline se marca como fallido y la protección de rama
bloquea el merge.

---

## 4. Configuración de Protección de Rama (Branch Protection)

Para que todo cambio pase por el pipeline antes de fusionarse en `main`, se debe
proteger la rama principal en GitHub.

### Pasos
1. En el repositorio de GitHub, ir a **Settings → Branches**.
2. En **Branch protection rules**, clic en **Add branch ruleset** (o **Add rule**).
3. En **Branch name pattern** escribir: `main`.
4. Activar las siguientes opciones:
   - **Require a pull request before merging** — obliga a que todo cambio entre por
     un Pull Request (no se puede hacer push directo a `main`).
   - **Require status checks to pass before merging** — obliga a que el pipeline
     apruebe antes de permitir el merge.
   - En el buscador de status checks, seleccionar los jobs del pipeline:
     `build`, `test-backend`, `test-frontend`, `e2e`, `analyze`.
   - (Opcional) **Require branches to be up to date before merging**.
5. Guardar la regla con **Create** / **Save changes**.

### Resultado
- No se puede hacer push directo a `main`; todo cambio requiere un Pull Request.
- Si alguna verificación del pipeline falla, GitHub **bloquea el botón de merge**.
- El estado del pipeline aparece automáticamente en cada Pull Request.

---

## 5. Manual de Uso — Enviar un cambio

Como la rama `main` está protegida, todo cambio debe enviarse mediante un Pull Request.
El flujo para un colaborador es:

### Paso a paso
1. **Crear una rama nueva** a partir de `main`:
   ```
   git checkout main
   git pull
   git checkout -b mi-cambio
   ```
2. **Hacer los cambios** en el código y guardarlos.
3. **Ejecutar las pruebas localmente** antes de subir (ver sección 2):
   ```
   cd escuintleco/backend && mvn verify
   cd ../frontend && npm run test:ci && npm run lint
   ```
4. **Commit y push** de la rama:
   ```
   git add .
   git commit -m "Descripcion del cambio"
   git push -u origin mi-cambio
   ```
5. **Abrir el Pull Request** en GitHub desde `mi-cambio` hacia `main`.
6. **Esperar el pipeline:** GitHub ejecuta automáticamente las etapas (build, test,
   e2e, analyze, report) y muestra el estado en el Pull Request.
7. **Revisar resultados:**
   - Si todas las verificaciones pasan (✓ verde), el botón de **Merge** se habilita.
   - Si alguna falla (✗ roja), revisar el log del job que falló, corregir, y volver a
     hacer push. El pipeline se re-ejecuta solo.
8. **Hacer merge** una vez aprobado el Pull Request y con el pipeline en verde.

### Reglas importantes
- No se puede hacer push directo a `main`.
- No se puede hacer merge si el pipeline no aprobó.
- Los reportes de cobertura quedan disponibles como artefactos descargables del run.

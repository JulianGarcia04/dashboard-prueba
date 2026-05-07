# Menüpp Dashboard — Growth & Farming

Dashboard interno para el equipo de Farming de Menüpp. Permite cargar archivos Excel de pedidos Mozrest, visualizar KPIs, gestionar farmers, generar informes por restaurante y sincronizar todo vía Firebase Storage.

## Estructura del proyecto

```
dashboard-menupp/
├── public/
│   ├── index.html          ← HTML principal (shell)
│   ├── styles.css          ← Estilos (paleta de marca Menüpp)
│   ├── app.js              ← Toda la lógica JS + Firebase Storage
│   └── firebase-config.js  ← GENERADO automáticamente desde .env (no comitear)
├── firebase/
│   └── firebaseConfig.js   ← Lee .env y exporta el config object (Node)
├── scripts/
│   └── generate-config.js  ← Escribe public/firebase-config.js desde .env
├── .env                    ← Credenciales Firebase (NO comitear)
├── .env.example            ← Plantilla de .env
├── .gitignore
└── package.json
```

## Requisitos

- Node.js 18+
- Una cuenta en [Firebase](https://console.firebase.google.com/) con:
  - Authentication (Email/Password) habilitado
  - Firestore Database creado
  - Storage habilitado

## Configuración inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Firebase

Copia `.env.example` a `.env` y llena los valores con los de tu proyecto Firebase:

```bash
cp .env.example .env
```

Edita `.env`:

```
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

### 3. Configurar reglas de Firebase

**Firestore** (`firestore.rules`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email in ['product@menupp.co'];
    }
  }
}
```

**Storage** (`storage.rules`):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /excel-uploads/{file} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email in ['product@menupp.co'];
    }
    match /orders/{file} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email in ['product@menupp.co'];
    }
  }
}
```

### 4. Correr el dashboard

```bash
npm start
```

Esto:
1. Lee `.env` y genera `public/firebase-config.js`
2. Levanta un servidor HTTP en `http://localhost:3000`
3. Abre el navegador automáticamente

## Uso

### Como Admin (`product@menupp.co`)

1. Inicia sesión con tu correo y contraseña de Firebase Auth
2. Ve a **📤 Subir Excel** → arrastra el archivo Excel de pedidos Mozrest
3. El dashboard procesa los datos localmente y los sube a Firebase Storage
4. Los datos quedan disponibles para todos los farmers en la nube

### Como Farmer

1. Inicia sesión con tus credenciales
2. Los datos se cargan automáticamente desde Firebase Storage
3. Puedes ver restaurantes, checklists, informes y cobros
4. Tus configuraciones (asignaciones, fees, checklist) se sincronizan con Firestore

## Funciones de Firebase Storage

- **`uploadExcelToFirebase(file)`** → Sube el Excel a `excel-uploads/{timestamp}-{nombre}.xlsx` y retorna la URL de descarga
- **`downloadExcelFromFirebase(url)`** → Descarga un Excel como ArrayBuffer
- **`parseExcelFile(buf, fname)`** → Parsea un ArrayBuffer con XLSX y retorna los datos
- **`updateDashboard()`** → Actualiza todos los charts y vistas con los datos actuales

## Modo local / demo

Si no hay Firebase configurado (`.env` vacío o con placeholders), el dashboard funciona en **modo local**:
- No requiere autenticación
- Los datos se guardan en `localStorage` del navegador
- Las funciones de Storage se deshabilitan silenciosamente
- Carga datos de demo con el botón "Cargar datos demo"

## Tecnologías

| Librería | Uso |
|---|---|
| Firebase 10 (Compat) | Auth + Firestore + Storage |
| Chart.js 4 | Gráficas de barras, línea, doughnut |
| Leaflet.js | Mapa de restaurantes |
| SheetJS (XLSX) | Parsing de archivos Excel |
| jsPDF + AutoTable | Generación de PDFs |
| JSZip | Descarga masiva de reportes |

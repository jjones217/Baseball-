# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Firebase setup (cross-device favorite team sync)

Sign-in and cross-device favorite-team sync are optional. The app works fully without them — the sign-in icon in the header simply doesn't render until Firebase is configured.

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication → Sign-in method → Google**
3. Create a **Firestore Database** (production mode)
4. Deploy the security rules in `firestore.rules`: `firebase deploy --only firestore:rules`
5. Copy `.env.example` to `.env` and fill in the values from Project Settings → General → Your apps → Web app config
6. Add the same variables in Vercel → Project Settings → Environment Variables for production/preview

`.env` is gitignored — never commit real Firebase credentials.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

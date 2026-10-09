# TaskFlow — React Todo Task Manager

A responsive todo/task manager built with React, TypeScript, Vite, and Lucide icons.

## Features

- Create, edit, delete, and complete tasks
- Priority levels: Low, Medium, High
- Optional descriptions and due dates
- Overdue task indicator
- Search by title or description
- Filter by status and priority
- Dashboard stats and completion progress
- Automatic persistence with `localStorage`
- Responsive desktop and mobile layouts
- Accessible labels and dialog semantics

## Requirements

- Node.js 18+ recommended
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Project structure

```text
react-todo-task-manager/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    └── styles.css
```

## Notes

- Tasks are stored in the browser's local storage on the current device/browser.
- Clearing browser site data will clear saved tasks.
- The starter list appears the first time the app is opened. You can delete those sample tasks.

# Restaurant Gustov - Sistema de Gestión
Sistema de gestión para restaurantes con módulos de menús, ventas y reportes.

# Características

Gestión de Platos y Períodos: CRUD de platos y horarios de comida

Administración de Menús: Creación de menús diarios

Registro de Ventas: Sistema de ventas con control de stock

Reportes: Análisis de ventas con filtros y exportación

# Tecnologías
Frontend
Angular 16.2.12

TypeScript 5.1.6

RxJS 7.8.2

Tailwind CSS
# Estructura del Proyecto

src/
├── app/
│   ├── features/restaurant-gustov/
│   │   ├── constants/          # Constantes y configuración
│   │   ├── models/            # Interfaces y modelos TypeScript
│   │   ├── service/           # Servicios y lógica de negocio
│   │   ├── utils/             # Utilidades reutilizables
│   │   └── views/             # Componentes de UI
│   │       ├── dish-and-meal-period/  # Gestión de platos
│   │       ├── menu/                  # Administración de menús
│   │       ├── report/                # Módulo de reportes 
│   │       └── sale/                  # Registro de ventas
│   ├── dialog-component/      # Servicio de diálogos
│   ├── toast-notification/    # Servicio de notificaciones
│   └── home/                  # Página principal
├── environments/              # Configuración de entornos
└── assets/                   # Recursos estáticos

# Prerrequisitos
Node.js 18.19.1+

npm 10.2.4+

Angular CLI 16.2.16
# AppInterview

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.14.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

# Vue Guitar

A modern Vue.js application for guitar business management, built with Vue 3, TypeScript, and PrimeVue.

## 🚀 Features

- **Modern Vue 3** with Composition API and TypeScript
- **PrimeVue UI Components** with custom theme
- **Responsive Design** with Tailwind CSS
- **Internationalization** (i18n) support (Italian/English)
- **Form Management** with validation and error handling
- **API Integration** with Axios
- **Code Splitting** with lazy-loaded routes
- **ESLint & Prettier** for code quality

## 🛠️ Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite
- **UI Library**: PrimeVue 4
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: Vue Router 4
- **State Management**: Vue Composition API
- **Build Tool**: Vite
- **Linting**: ESLint + Prettier

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── ui/             # UI components
├── composables/        # Vue composables
├── config/             # Configuration files
├── docs/               # Documentation
├── locales/            # i18n translations
├── router/             # Vue Router configuration
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── views/              # Page components
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vue-guitar

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory:

```env
# TODO App Configuration
VITE_APP_TITLE=Vue Guitar
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEV_TOOLS=true
```

## 🌍 Internationalization

The application supports multiple languages:

- **Italian (IT)** - Default language
- **English (EN)** - Secondary language

### Using i18n in components

```vue
<script setup lang="ts">
import { useLedgerConstants } from '@/utils/i18nConstants'

const constants = useLedgerConstants()
</script>
```

See `src/docs/i18n-usage.md` for detailed documentation.

## 📝 Code Style

This project follows Vue.js and TypeScript best practices:

- **Composition API** for component logic
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Multi-word component names** for Vue components
- **Consistent file naming** (kebab-case for components, camelCase for utilities)
- **i18n composables** for internationalized constants

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

# CNC Frontend Application

A modern React-based frontend application for CNC operations management. This application provides a comprehensive interface for managing CNC operations, loss reports, and administrative settings.

## Features

- 🎨 Modern UI with Material-UI components
- 🌓 Light/Dark theme support
- 🔒 Secure authentication system
- 📊 Interactive dashboard
- 📝 Loss report management
- ⚙️ Administrative settings
- 🚀 Built with Vite for optimal performance

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deploying To GitHub Pages

This app is configured for GitHub Pages hosting using a hash-based router, so route refreshes work without extra server rewrites.

1. Push the project to a GitHub repository.
2. In the repository settings, enable GitHub Pages and select GitHub Actions as the source.
3. Push to `main` or run the `Deploy to GitHub Pages` workflow manually.

The frontend build uses a fallback API base URL of `https://floodbot.cnc.claims:7001` if `VITE_API_BASE_URL` is not provided during build time. If you want a different backend, set that environment variable in your local `.env` file or in GitHub Actions secrets/variables before deployment.

## Documentation

For detailed documentation about the project structure, components, and features, please refer to the [documentation](./docs/documentation.md).

## Development

This project is built with React + Vite, providing:
- Hot Module Replacement (HMR)
- ESLint configuration
- Material-UI components
- React Router for navigation

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technical Stack

- React 18
- Vite
- Material-UI
- React Router
- ESLint

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

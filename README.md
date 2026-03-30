# Pokédex - React Native App

[<img src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png" alt="Get it on F-Droid" height="80">](https://f-droid.org/packages/com.mouzinho.pokebase)

A modern Pokédex application built with React Native, Expo, and TypeScript, following **Feature-Sliced Design (FSD)** architecture principles.

## 📱 Features

- Browse Pokémon with beautiful cards showing types, images, and details
- Real-time search and filtering by name
- Smooth scrolling and optimized performance
- Type-safe with TypeScript
- Clean, maintainable architecture

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo Go app (for mobile testing)

### Installation

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npx expo start
   ```

3. Run on your device
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Press `w` for web browser

## 🏗️ Architecture - Feature-Sliced Design (FSD)

This project follows **Feature-Sliced Design**, a frontend architecture methodology that organizes code by business features and technical layers.

### Project Structure

```
pokedex/
├── app/               # Application entry point
├── pages/             # Application screens/pages
├── widgets/           # Composite UI blocks
├── features/          # Business features (filter, load)
├── entities/          # Business entities (Pokemon)
├── components/        # Shared UI components
└── constants/         # Theme and configuration
```

### Layer Hierarchy

```
┌─────────────────────────────────────────┐
│              app/                       │  ← Entry Point
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│             pages/                      │  ← Page Composition
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            widgets/                     │  ← Composite Blocks
└─────────────────────────────────────────┘
                    ↓
┌──────────────────┬──────────────────────┐
│    features/     │     features/        │  ← User Features
│ filter-pokemons  │  load-pokemons       │
└──────────────────┴──────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           entities/pokemon/             │  ← Domain Models
└─────────────────────────────────────────┘
```

### Key Principles

✅ **Unidirectional dependency flow** - Layers only depend on layers below  
✅ **Public APIs** - Each slice exposes a clear contract via `index.ts`  
✅ **Feature isolation** - Features are independent and don't know about each other  
✅ **Composition over configuration** - Direct imports instead of dependency injection  

### Layers Explained

#### 📦 Entities (`entities/`)
Domain-driven business entities.

```
entities/pokemon/
├── model/          # Pokemon, PokemonType models
├── api/            # API calls and mappers
├── ui/             # PokemonCard component
└── index.ts        # Public API exports
```

#### ⚡ Features (`features/`)
Isolated user interactions and business logic.

- `filter-pokemons/` - Pure filtering function
- `load-pokemons/` - Data loading with caching and debouncing

#### 🧩 Widgets (`widgets/`)
Composite UI blocks combining features and entities.

```typescript
// widgets/pokemon-list/
export function PokemonListWidget({ limit, offset }) {
  const { pokemons, loading, error } = useLoadPokemons(limit, offset);
  return <FlatList data={pokemons} ... />;
}
```

#### 📄 Pages (`pages/`)
Application screens composing widgets and features.

```typescript
// pages/pokemon-list/
export default function PokemonListPage() {
  const { pokemons, filterByName } = useLoadPokemons(10, 0);
  return <SafeAreaView>...</SafeAreaView>;
}
```

## 🧪 Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## 🛠️ Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **React Hooks** - State management
- **PokeAPI** - Pokémon data source

## 📚 Code Organization Benefits

1. **Scalability** - Add new features without touching existing ones
2. **Maintainability** - Clear structure makes code easy to find
3. **Testability** - Isolated features are simple to test
4. **Team Collaboration** - Multiple developers can work independently
5. **Reusability** - Features and entities work across multiple pages

## 🔧 Development Patterns

### Hook Composition

```typescript
// features/load-pokemons/model/use-load-pokemons.ts
export function useLoadPokemons(limit: number, offset: number) {
  const [state, setState] = useState<PokemonsState>({...});
  const timerRef = useRef<SearchTermTimeout | null>(null);
  
  // Compose filter feature
  const filteredPokemons = useMemo(() => {
    return filterPokemonsByName(state.pokemons, debouncedSearchTerm);
  }, [state.pokemons, debouncedSearchTerm]);
  
  return { loading, error, pokemons: filteredPokemons, filterByName };
}
```

### Public API Pattern

```typescript
// entities/pokemon/index.ts
export { Pokemon } from "./model/pokemon";
export { fetchPokemons } from "./api/pokemon-api";
export { PokemonCard } from "./ui/pokemon-card";
```

## 📖 Additional Documentation

- `FSD_ARCHITECTURE.md` - Detailed architecture documentation
- `MIGRATION_SUMMARY.md` - Migration guide from Clean Architecture to FSD

## 🤝 Contributing

Contributions are welcome! Please follow the FSD architecture principles when adding new features.

## 📄 License

This project is for educational purposes.

## 🔗 Resources

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [PokeAPI](https://pokeapi.co/)

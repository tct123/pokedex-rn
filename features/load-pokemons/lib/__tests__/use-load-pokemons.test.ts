import { Pokemon } from "@/entities/pokemon";
import { createWrapper } from "@/shared/test-utils/react-query-wrapper";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useLoadPokemons } from "../use-load-pokemons";

// Mock the API module
jest.mock("@/entities/pokemon/api/pokemon-api");

const { fetchPokemons } = jest.requireMock("@/entities/pokemon/api/pokemon-api");

describe("useLoadPokemons with React Query", () => {
  const mockPokemon1: Pokemon = {
    id: "001",
    name: "Bulbasaur",
    types: [],
    image: "https://example.com/bulbasaur.png",
    stats: [],
  };

  const mockPokemon2: Pokemon = {
    id: "002",
    name: "Ivysaur",
    types: [],
    image: "https://example.com/ivysaur.png",
    stats: [],
  };

  const mockPokemon3: Pokemon = {
    id: "003",
    name: "Venusaur",
    types: [],
    image: "https://example.com/venusaur.png",
    stats: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load pokemons on initial render", async () => {
    fetchPokemons.mockResolvedValueOnce([mockPokemon1, mockPokemon2]);

    const { result } = renderHook(() => useLoadPokemons(10), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.pokemons).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.pokemons).toEqual([mockPokemon1, mockPokemon2]);
    expect(result.current.state.error).toBe(null);
    expect(fetchPokemons).toHaveBeenCalledWith(10, 0);
    expect(fetchPokemons).toHaveBeenCalledTimes(1);
  });

  it("should handle loading states correctly", async () => {
    fetchPokemons.mockResolvedValueOnce([mockPokemon1]);

    const { result } = renderHook(() => useLoadPokemons(10), {
      wrapper: createWrapper(),
    });

    // Check initial loading state
    expect(result.current.state.loading).toBe(true);
    expect(result.current.state.isNextPageLoading).toBe(false);

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.isNextPageLoading).toBe(false);
  });

  it("should handle errors correctly", async () => {
    const errorMessage = "Network error";
    fetchPokemons.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useLoadPokemons(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.error).toBe(errorMessage);
    expect(result.current.state.pokemons).toBe(null);
  });

  it("should fetch next page when fetchNextPage is called", async () => {
    // First page
    fetchPokemons.mockResolvedValueOnce([mockPokemon1, mockPokemon2]);
    // Second page
    fetchPokemons.mockResolvedValueOnce([mockPokemon3]);

    const { result } = renderHook(() => useLoadPokemons(2), {
      wrapper: createWrapper(),
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.pokemons).toEqual([mockPokemon1, mockPokemon2]);

    // Fetch next page
    result.current.actions.fetchNextPage();

    // Wait for next page to load
    await waitFor(() => {
      expect(result.current.state.pokemons).toEqual([
        mockPokemon1,
        mockPokemon2,
        mockPokemon3,
      ]);
    });

    expect(result.current.state.isNextPageLoading).toBe(false);
    expect(fetchPokemons).toHaveBeenCalledWith(2, 0); // First call
    expect(fetchPokemons).toHaveBeenCalledWith(2, 2); // Second call
    expect(fetchPokemons).toHaveBeenCalledTimes(2);
  });

  it("should detect end of items when page has fewer items than limit", async () => {
    // Return only 1 pokemon when limit is 10 (indicates end of list)
    fetchPokemons.mockResolvedValueOnce([mockPokemon1]);

    const { result } = renderHook(() => useLoadPokemons(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    // Should detect end of items
    expect(result.current.state.endOfItems).toBe(true);
  });

  it("should not detect end of items when page is full", async () => {
    // Return full page (10 items when limit is 10)
    const fullPage = Array.from({ length: 10 }, (_, i) => ({
      id: `00${i + 1}`,
      name: `Pokemon${i + 1}`,
      types: [],
      image: `https://example.com/pokemon${i + 1}.png`,
      stats: [],
    }));
    fetchPokemons.mockResolvedValueOnce(fullPage);

    const { result } = renderHook(() => useLoadPokemons(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    // Should NOT detect end of items (full page means there might be more)
    expect(result.current.state.endOfItems).toBe(false);
  });
});

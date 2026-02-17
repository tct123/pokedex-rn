import { Pokemon } from "@/entities/pokemon";
import { createWrapper } from "@/shared/test-utils/react-query-wrapper";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useLoadPokemons } from "../use-load-pokemons";

// Mock the API module
jest.mock("@/entities/pokemon/api/pokemon-api");

const { fetchPokemons, fetchPokemon } = jest.requireMock(
  "@/entities/pokemon/api/pokemon-api"
);

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
    fetchPokemons.mockResolvedValueOnce(["001", "002"]);
    fetchPokemon.mockImplementation((id: string) => {
      if (id === "001") return Promise.resolve(mockPokemon1);
      if (id === "002") return Promise.resolve(mockPokemon2);
    });

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
    fetchPokemons.mockResolvedValueOnce(["001"]);
    fetchPokemon.mockResolvedValue(mockPokemon1);

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
    // First page returns 2 IDs
    fetchPokemons.mockResolvedValueOnce(["001", "002"]);
    // Second page returns 1 ID
    fetchPokemons.mockResolvedValueOnce(["003"]);

    fetchPokemon.mockImplementation((id: string) => {
      if (id === "001") return Promise.resolve(mockPokemon1);
      if (id === "002") return Promise.resolve(mockPokemon2);
      if (id === "003") return Promise.resolve(mockPokemon3);
    });

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
    // Return only 1 ID when limit is 10 (indicates end of list)
    fetchPokemons.mockResolvedValueOnce(["001"]);
    fetchPokemon.mockResolvedValue(mockPokemon1);

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
    // Return full page (10 IDs when limit is 10)
    const ids = Array.from({ length: 10 }, (_, i) =>
      String(i + 1).padStart(3, "0")
    );
    fetchPokemons.mockResolvedValueOnce(ids);

    const pokemons = ids.map((id) => ({
      id,
      name: `Pokemon${id}`,
      types: [],
      image: `https://example.com/pokemon${id}.png`,
      stats: [],
    }));
    fetchPokemon.mockImplementation((id: string) => {
      const pokemon = pokemons.find((p) => p.id === id);
      return Promise.resolve(pokemon);
    });

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

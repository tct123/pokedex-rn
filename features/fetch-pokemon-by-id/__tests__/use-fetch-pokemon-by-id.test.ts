import { Pokemon } from "@/entities/pokemon";
import { createWrapper } from "@/shared/test-utils/react-query-wrapper";
import { renderHook, waitFor } from "@testing-library/react-native";
import useFetchPokemonById from "../use-fetch-pokemon-by-id";

// Mock the API module
jest.mock("@/entities/pokemon/api/pokemon-api");

const { fetchPokemon } = jest.requireMock("@/entities/pokemon/api/pokemon-api");

describe("useFetchPokemonById with React Query", () => {
  const mockPokemon: Pokemon = {
    id: "025",
    name: "Pikachu",
    types: [],
    image: "https://example.com/pikachu.png",
    stats: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch pokemon by id successfully", async () => {
    fetchPokemon.mockResolvedValueOnce(mockPokemon);

    const { result } = renderHook(() => useFetchPokemonById("025"), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.pokemon).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pokemon).toEqual(mockPokemon);
    expect(result.current.error).toBe(null);
    expect(fetchPokemon).toHaveBeenCalledWith("025");
    expect(fetchPokemon).toHaveBeenCalledTimes(1);
  });

  it("should handle loading state correctly", async () => {
    fetchPokemon.mockResolvedValueOnce(mockPokemon);

    const { result } = renderHook(() => useFetchPokemonById("025"), {
      wrapper: createWrapper(),
    });

    // Check initial loading state
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.loading).toBe(false);
  });

  it("should handle errors correctly", async () => {
    const errorMessage = "Pokemon not found";
    fetchPokemon.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useFetchPokemonById("999"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.pokemon).toBe(null);
  });

  it("should not fetch when id is empty", async () => {
    const { result } = renderHook(() => useFetchPokemonById(""), {
      wrapper: createWrapper(),
    });

    // Query should be disabled, so loading should be false
    expect(result.current.loading).toBe(false);
    expect(result.current.pokemon).toBe(null);
    expect(result.current.error).toBe(null);
    expect(fetchPokemon).not.toHaveBeenCalled();
  });

  it("should refetch when id changes", async () => {
    const mockPokemon2: Pokemon = {
      id: "001",
      name: "Bulbasaur",
      types: [],
      image: "https://example.com/bulbasaur.png",
      stats: [],
    };

    fetchPokemon.mockResolvedValueOnce(mockPokemon);
    fetchPokemon.mockResolvedValueOnce(mockPokemon2);

    const { result, rerender } = renderHook(
      (props: { id: string }) => useFetchPokemonById(props.id),
      {
        wrapper: createWrapper(),
        initialProps: { id: "025" },
      }
    );

    // Wait for first fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pokemon).toEqual(mockPokemon);

    // Change id
    rerender({ id: "001" });

    // Wait for second fetch
    await waitFor(() => {
      expect(result.current.pokemon).toEqual(mockPokemon2);
    });

    expect(fetchPokemon).toHaveBeenCalledWith("025");
    expect(fetchPokemon).toHaveBeenCalledWith("001");
    expect(fetchPokemon).toHaveBeenCalledTimes(2);
  });
});

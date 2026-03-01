import { mapResponseTypeToPokemonType } from "../pokemon-mapper";

describe("mapResponseTypeToPokemonType", () => {
  const allTypes: [string, string][] = [
    ["bug", "Bug"],
    ["dark", "Dark"],
    ["dragon", "Dragon"],
    ["electric", "Electric"],
    ["fairy", "Fairy"],
    ["fighting", "Fighting"],
    ["fire", "Fire"],
    ["flying", "Flying"],
    ["ghost", "Ghost"],
    ["grass", "Grass"],
    ["ground", "Ground"],
    ["ice", "Ice"],
    ["normal", "Normal"],
    ["poison", "Poison"],
    ["psychic", "Psychic"],
    ["rock", "Rock"],
    ["steel", "Steel"],
    ["water", "Water"],
  ];

  it.each(allTypes)('maps "%s" to a type named "%s"', (input, expectedName) => {
    const type = mapResponseTypeToPokemonType(input);
    expect(type.name).toBe(expectedName);
  });

  it("falls back to Normal for an unrecognised type string", () => {
    const type = mapResponseTypeToPokemonType("shadow");
    expect(type.name).toBe("Normal");
  });

  it("is case-insensitive", () => {
    expect(mapResponseTypeToPokemonType("FIRE").name).toBe("Fire");
    expect(mapResponseTypeToPokemonType("Water").name).toBe("Water");
    expect(mapResponseTypeToPokemonType("GRASS").name).toBe("Grass");
  });

  it("returns an object with the required PokemonType shape", () => {
    const type = mapResponseTypeToPokemonType("fire");
    expect(type).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        backgroundColor: expect.any(String),
        foregroundColor: expect.any(String),
      }),
    );
  });

  it("returns the same type instance for repeated calls (map is pre-built)", () => {
    const first = mapResponseTypeToPokemonType("water");
    const second = mapResponseTypeToPokemonType("water");
    expect(first).toBe(second);
  });
});

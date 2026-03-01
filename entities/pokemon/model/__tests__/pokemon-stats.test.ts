import { mapPokemonStat, mapPokemonStats } from "../pokemon-stats";

describe("mapPokemonStat", () => {
  it("maps base_stat to baseStat", () => {
    const result = mapPokemonStat({ name: "hp", base_stat: 45 });
    expect(result.baseStat).toBe(45);
  });

  it("capitalizes the stat name", () => {
    const result = mapPokemonStat({ name: "hp", base_stat: 45 });
    expect(result.name).toBe("Hp");
  });

  it("replaces the first hyphen in the stat name with a space", () => {
    const result = mapPokemonStat({ name: "special-attack", base_stat: 65 });
    expect(result.name).toBe("Special attack");
  });

  it("capitalizes multi-word stat names correctly", () => {
    const result = mapPokemonStat({ name: "special-defense", base_stat: 65 });
    expect(result.name).toBe("Special defense");
  });

  it("defaults effort to 0 when not provided", () => {
    const result = mapPokemonStat({ name: "hp", base_stat: 45 });
    expect(result.effort).toBe(0);
  });

  it("uses the provided effort value", () => {
    const result = mapPokemonStat({ name: "hp", base_stat: 45 }, 2);
    expect(result.effort).toBe(2);
  });
});

describe("mapPokemonStats", () => {
  const baseStats = [
    { name: "hp", base_stat: 45 },
    { name: "attack", base_stat: 49 },
    { name: "defense", base_stat: 49 },
    { name: "special-attack", base_stat: 65 },
    { name: "special-defense", base_stat: 65 },
    { name: "speed", base_stat: 45 },
  ];

  it("maps all stats in the array", () => {
    const result = mapPokemonStats(baseStats);
    expect(result).toHaveLength(6);
  });

  it("preserves base_stat values across the array", () => {
    const result = mapPokemonStats(baseStats);
    expect(result[0].baseStat).toBe(45);
    expect(result[1].baseStat).toBe(49);
    expect(result[3].baseStat).toBe(65);
  });

  it("applies ev_yield effort from the evYield map", () => {
    const evYield = { "special-attack": 1 };
    const result = mapPokemonStats(baseStats, evYield);
    const spAtk = result.find((s) => s.name === "Special attack");
    expect(spAtk?.effort).toBe(1);
  });

  it("defaults effort to 0 for stats not in evYield", () => {
    const evYield = { "special-attack": 1 };
    const result = mapPokemonStats(baseStats, evYield);
    const hp = result.find((s) => s.name === "Hp");
    expect(hp?.effort).toBe(0);
  });

  it("defaults all efforts to 0 when evYield is not provided", () => {
    const result = mapPokemonStats(baseStats);
    expect(result.every((s) => s.effort === 0)).toBe(true);
  });

  it("defaults all efforts to 0 when evYield is empty", () => {
    const result = mapPokemonStats(baseStats, {});
    expect(result.every((s) => s.effort === 0)).toBe(true);
  });

  it("handles an empty stats array", () => {
    const result = mapPokemonStats([]);
    expect(result).toEqual([]);
  });

  it("handles multiple ev_yield entries", () => {
    const evYield = { "special-attack": 1, attack: 2 };
    const result = mapPokemonStats(baseStats, evYield);
    const atk = result.find((s) => s.name === "Attack");
    const spAtk = result.find((s) => s.name === "Special attack");
    expect(atk?.effort).toBe(2);
    expect(spAtk?.effort).toBe(1);
  });
});

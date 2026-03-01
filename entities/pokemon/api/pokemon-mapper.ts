import {
  BugType,
  DarkType,
  DragonType,
  ElectricType,
  FairyType,
  FightingType,
  FireType,
  FlyingType,
  GhostType,
  GrassType,
  GroundType,
  IceType,
  NormalType,
  PoisonType,
  PokemonType,
  PsychicType,
  RockType,
  SteelType,
  WaterType,
} from "../model/pokemon-type";

const TYPE_MAP: Record<string, PokemonType> = {
  bug: new BugType(),
  dark: new DarkType(),
  dragon: new DragonType(),
  electric: new ElectricType(),
  fairy: new FairyType(),
  fighting: new FightingType(),
  fire: new FireType(),
  flying: new FlyingType(),
  ghost: new GhostType(),
  grass: new GrassType(),
  ground: new GroundType(),
  ice: new IceType(),
  normal: new NormalType(),
  poison: new PoisonType(),
  psychic: new PsychicType(),
  rock: new RockType(),
  steel: new SteelType(),
  water: new WaterType(),
};

export const mapResponseTypeToPokemonType = (type: string): PokemonType => {
  return TYPE_MAP[String(type).toLowerCase()] ?? TYPE_MAP.normal;
};

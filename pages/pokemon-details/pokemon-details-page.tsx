import PokemonInfo from "@/components/ui/pokemon-info";
import useFetchPokemonById from "@/features/fetch-pokemon-by-id/use-fetch-pokemon-by-id";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function PokemonDetailsPage() {
  const { id } = useLocalSearchParams();
  const { pokemon } = useFetchPokemonById(String(id));
  return (
    pokemon && (
      <View
        className="pt-24 flex-1"
        style={{ backgroundColor: pokemon?.types[0].backgroundColor }}
      >
        <PokemonInfo id={pokemon.id} name={pokemon.name} types={pokemon.types} className="self-center" />
        <View className="bg-white flex-1 rounded-t-3xl mt-12 p-4" />
      </View>
    )
  );
}

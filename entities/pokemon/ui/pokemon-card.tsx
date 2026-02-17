import { Badge } from "@/components/ui/badge";
import { TextColors } from "@/constants/theme";
import { Image as ExpoImage } from "expo-image";
import React from "react";
import {
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { Pokemon } from "../model/pokemon";

interface PokemonCardProps {
  pokemon: Pokemon;
  onTap: (pokemonId: string) => void;
  className?: string;
}

export const PokemonCard = React.memo(function PokemonCard({ pokemon, onTap, className }: PokemonCardProps) {
  return (
    <View className={`relative ${className ?? ""}`}>
      <Pressable
        onPress={() => onTap(pokemon.id)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View
          className="rounded-[10px] flex-row justify-between mt-6"
          style={{ backgroundColor: pokemon.types[0].backgroundColor }}
        >
          <View className="p-5">
            <Text
              style={{ color: TextColors.number }}
              className="text-xs font-bold"
            >
              {pokemon.id}
            </Text>
            <Text className="text-[26px] font-bold text-white">
              {pokemon.name}
            </Text>
            <View className="flex-row items-center self-start mt-1.5 gap-1.5">
              {pokemon.types.map((type, _) => (
                <Badge
                  key={`${pokemon.id}-${type.name}`}
                  image={type.icon}
                  label={type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                  backgroundColor={type.foregroundColor}
                />
              ))}
            </View>
          </View>
          <Image source={require("@/assets/images/pokeball_transparent.png")} />
        </View>
        <Image
          source={require("@/assets/images/card_pattern.png")}
          className="absolute left-[90px] top-[30px]"
        />
        <ExpoImage
          source={{ uri: pokemon.image }}
          style={{ width: 130, height: 130, position: "absolute", right: 10 }}
          cachePolicy="memory-disk"
          recyclingKey={pokemon.id}
        />
      </Pressable>
    </View>
  );
});

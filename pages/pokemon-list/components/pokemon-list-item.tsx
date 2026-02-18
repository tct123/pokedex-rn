import { SearchBar } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { LightColors } from "@/constants/theme";
import { PokemonCard } from "@/entities/pokemon";
import { memo, useCallback } from "react";
import { ActivityIndicator, Text } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePokemonListContext } from "../context/pokemon-list-context";
import { router } from "expo-router";
import type { ListItem } from "../hooks/use-pokemon-list-data";
import type { Pokemon } from "@/entities/pokemon";

export const PokemonSearchBarItem = memo(function PokemonSearchBarItem() {
  const { isSticky, searchValue, handleSearch } = usePokemonListContext();
  const safeAreaInsets = useSafeAreaInsets();

  const stickyPaddingStyle = useAnimatedStyle(() => ({
    paddingTop: withTiming(isSticky.value ? safeAreaInsets.top : 12, { duration: 200 }),
  }));

  return (
    <Animated.View
      className="bg-white px-4 pb-4 pt-3 overflow-visible"
      style={stickyPaddingStyle}
    >
      <SearchBar
        value={searchValue}
        onSearch={handleSearch}
        placeholder="What Pokémon are you looking for?"
      />
    </Animated.View>
  );
});

export function PokemonListItem({ item }: { item: ListItem }) {
  if (item.type === "search") {
    return <PokemonSearchBarItem />;
  }
  if (item.type === "empty") {
    return (
      <EmptyState
        title="No Pokémon found"
        message="Try searching with a different name or National Pokédex number"
        image={require("@/assets/images/magikarp.png")}
      />
    );
  }
  if (item.type === "loading") {
    return (
      <ActivityIndicator
        color={LightColors.primary}
        size="large"
        className="flex-1 self-center"
      />
    );
  }
  if (item.type === "error") {
    return <PokemonErrorItem />;
  }
  return <PokemonCardItem pokemon={item.data} />;
}

function PokemonErrorItem() {
  const { loadPokemonsState } = usePokemonListContext();
  return <Text className="flex-1 self-center">Error: {loadPokemonsState.error}</Text>;
}

const PokemonCardItem = memo(function PokemonCardItem({
  pokemon,
}: {
  pokemon: Pokemon;
}) {
  const handleTap = useCallback((id: string) => {
    router.push({ pathname: "/pokemon/details", params: { id } });
  }, []);

  return <PokemonCard onTap={handleTap} pokemon={pokemon} className="my-1 mx-4" />;
});

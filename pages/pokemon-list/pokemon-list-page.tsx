import { SearchBar } from "@/components/ui/search-bar";
import { LightColors } from "@/constants/theme";
import { Pokemon, PokemonCard } from "@/entities/pokemon";
import { useLoadPokemons } from "@/features/load-pokemons";
import { useFilterPokemonList } from "@/features/filter-pokemon-list";
import { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PokemonListHeader } from "./components/pokemon-list-header";
import { PokemonListState } from "./components/pokemon-list-state";
import { router } from "expo-router";

type ListItem = { type: "search" } | { type: "pokemon"; data: Pokemon };

export default function PokemonListPage() {
  const { state: loadPokemonsState, actions: loadPokemonsActions } = useLoadPokemons();
  const { state: searchState, actions: searchActions } = useFilterPokemonList(
    loadPokemonsState.pokemons,
  );
  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useRef(0);
  const listRef = useRef<FlatList<ListItem>>(null);
  const wasLoadingNextPage = useRef(false);
  const currentScrollOffset = useRef(0);
  const isSticky = useSharedValue(false);

  const stickyPaddingStyle = useAnimatedStyle(() => ({
    paddingTop: withTiming(isSticky.value ? safeAreaInsets.top : 12, { duration: 200 }),
  }));

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      currentScrollOffset.current = offsetY;
      isSticky.value = offsetY >= headerHeight.current;
    },
    [isSticky],
  );

  useEffect(() => {
    if (wasLoadingNextPage.current && !loadPokemonsState.isNextPageLoading) {
      const CARD_HEIGHT = 140;
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: currentScrollOffset.current + CARD_HEIGHT,
          animated: true,
        });
      }, 100);
    }
    wasLoadingNextPage.current = loadPokemonsState.isNextPageLoading;
  }, [loadPokemonsState.isNextPageLoading]);

  const displayPokemons = searchState.isSearching
    ? searchState.pokemons
    : loadPokemonsState.pokemons;
  const showFooterLoading =
    loadPokemonsState.isNextPageLoading && !searchState.isSearching;

  const listData: ListItem[] = [
    { type: "search" },
    ...(displayPokemons?.map((p) => ({ type: "pokemon" as const, data: p })) ?? []),
  ];

  return (
    <View className="flex-1">
      <PokemonListState
        loading={loadPokemonsState.loading}
        error={loadPokemonsState.error}
      />
      {displayPokemons && (
        <FlatList
          ref={listRef}
          className="flex-1 mb-4"
          data={listData}
          renderItem={({ item }) => {
            if (item.type === "search") {
              return (
                <Animated.View className="bg-white px-4 py-3" style={stickyPaddingStyle}>
                  <SearchBar
                    onSearch={searchActions.onSearch}
                    placeholder="What Pokémon are you looking for?"
                  />
                </Animated.View>
              );
            }
            return (
              <PokemonCard
                onTap={(id) =>
                  router.push({
                    pathname: "/pokemon/details",
                    params: { id },
                  })
                }
                pokemon={item.data}
                className="my-1 mx-4"
              />
            );
          }}
          keyExtractor={(item) =>
            item.type === "search" ? "search-bar" : item.data.id
          }
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          onScroll={handleScroll}
          ListHeaderComponent={
            <View onLayout={(e) => { headerHeight.current = e.nativeEvent.layout.height; }}>
              <PokemonListHeader />
            </View>
          }
          onEndReached={
            searchState.isSearching || loadPokemonsState.endOfItems
              ? undefined
              : loadPokemonsActions.fetchNextPage
          }
          onEndReachedThreshold={0.2}
          scrollEventThrottle={16}
          ListFooterComponent={
            showFooterLoading ? (
              <ActivityIndicator
                color={LightColors.primary}
                size={24}
                className="p-2"
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

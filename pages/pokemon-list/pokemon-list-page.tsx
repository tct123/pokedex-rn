import { SearchBar } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { FloatingScrollButton } from "@/components/ui/floating-scroll-button";
import { LightColors } from "@/constants/theme";
import { Pokemon, PokemonCard } from "@/entities/pokemon";
import { useLoadPokemons } from "@/features/load-pokemons";
import { useFilterPokemonList } from "@/features/filter-pokemon-list";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PokemonListHeader } from "./components/pokemon-list-header";
import { PokemonListState } from "./components/pokemon-list-state";
import { usePokemonListScroll } from "./hooks/use-pokemon-list-scroll";
import { router } from "expo-router";

type ListItem = { type: "search" } | { type: "pokemon"; data: Pokemon } | { type: "empty" };

export default function PokemonListPage() {
  const { state: loadPokemonsState, actions: loadPokemonsActions } = useLoadPokemons();
  const { state: searchState, actions: searchActions } = useFilterPokemonList(
    loadPokemonsState.pokemons,
  );
  const { refList, setOffsetY } = usePokemonListScroll(
    loadPokemonsState.pokemons,
    searchState.isSearching,
  );
  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = useRef(0);
  const isSticky = useSharedValue(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const stickyPaddingStyle = useAnimatedStyle(() => ({
    paddingTop: withTiming(isSticky.value ? safeAreaInsets.top : 12, { duration: 200 }),
  }));

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      setOffsetY(offsetY);
      isSticky.value = offsetY >= headerHeight.current;

      // Show button after scrolling past ~8 items (approximately 1000px)
      // Each pokemon card is roughly 120-130px tall with margins
      const SCROLL_THRESHOLD = 1000;
      setShowScrollButton(offsetY > SCROLL_THRESHOLD);
    },
    [isSticky, setOffsetY],
  );

  const displayPokemons = searchState.isSearching
    ? searchState.pokemons
    : loadPokemonsState.pokemons;
  const showFooterLoading =
    (loadPokemonsState.isNextPageLoading && !searchState.isSearching) ||
    searchState.isApiSearching;

  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [{ type: "search" }];

    if (searchState.isSearching && displayPokemons?.length === 0 && !searchState.isApiSearching) {
      items.push({ type: "empty" });
    } else {
      items.push(...(displayPokemons?.map((p) => ({ type: "pokemon" as const, data: p })) ?? []));
    }

    return items;
  }, [displayPokemons, searchState.isSearching, searchState.isApiSearching]);

  const handleTap = useCallback((id: string) => {
    router.push({
      pathname: "/pokemon/details",
      params: { id },
    });
  }, []);

  const scrollToTop = useCallback(() => {
    refList.current?.scrollToOffset({ offset: 0, animated: true });
  }, [refList]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "search") {
        return (
          <Animated.View className="bg-white px-4 pb-4 pt-3 overflow-visible" style={stickyPaddingStyle}>
            <SearchBar
              onSearch={searchActions.onSearch}
              placeholder="What Pokémon are you looking for?"
            />
          </Animated.View>
        );
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
      return (
        <PokemonCard
          onTap={handleTap}
          pokemon={item.data}
          className="my-1 mx-4"
        />
      );
    },
    [stickyPaddingStyle, searchActions.onSearch, handleTap],
  );

  return (
    <View className="flex-1">
      <PokemonListState
        loading={loadPokemonsState.loading}
        error={loadPokemonsState.error}
      />
      {displayPokemons && (
        <FlashList
          ref={refList}
          className="flex-1 mb-4"
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => {
            if (item.type === "search") return "search-bar";
            if (item.type === "empty") return "empty-state";
            return item.data.id;
          }}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          onScroll={handleScroll}
          removeClippedSubviews={true}
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
      <FloatingScrollButton visible={showScrollButton} onPress={scrollToTop} />
    </View>
  );
}

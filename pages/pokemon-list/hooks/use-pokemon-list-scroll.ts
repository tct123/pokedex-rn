import { FlashListRef } from "@shopify/flash-list";
import { useEffect, useRef } from "react";

export function usePokemonListScroll<T>(listIsNotEmpty: boolean, isSearching: boolean) {
  const refList = useRef<FlashListRef<T> | null>(null);
  const refPreviousIsSearching = useRef(isSearching);

  useEffect(() => {
    const wasSearching = refPreviousIsSearching.current;
    if (wasSearching && listIsNotEmpty) {
      refList?.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
    refPreviousIsSearching.current = isSearching;
  }, [listIsNotEmpty, isSearching, refList]);

  return { refList };
}

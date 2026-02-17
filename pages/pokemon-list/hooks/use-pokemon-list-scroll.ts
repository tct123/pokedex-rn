import { FlashListRef } from "@shopify/flash-list";
import { useEffect, useRef } from "react";

export function usePokemonListScroll<T>(
  listIsNotEmpty: boolean,
  isSearching: boolean,
) {
  const refList = useRef<FlashListRef<T> | null>(null);
  const refOffsetY = useRef(0);
  const refPreviousIsSearching = useRef(isSearching);

  useEffect(() => {
    const wasSearching = refPreviousIsSearching.current;
    if (wasSearching && !isSearching && listIsNotEmpty) {
      refList?.current?.scrollToOffset({
        offset: refOffsetY.current,
        animated: true,
      });
    }
    refPreviousIsSearching.current = isSearching;
  }, [listIsNotEmpty, isSearching, refList]);

  const setOffsetY = (offsetY: number) => {
    if (isSearching) return;
    refOffsetY.current = offsetY;
  };

  return { refList, setOffsetY };
}

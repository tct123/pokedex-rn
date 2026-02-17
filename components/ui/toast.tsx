import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LightColors } from "@/constants/theme";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
}

export const Toast = React.memo(function Toast({
  message,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (message) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });

      const dismissTimeout = setTimeout(() => {
        translateY.value = withTiming(100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        setTimeout(onDismiss, 300);
      }, duration);

      return () => clearTimeout(dismissTimeout);
    }
  }, [message, duration, onDismiss, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!message) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 16,
          right: 16,
          backgroundColor: LightColors.inverseSurface,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
        },
        animatedStyle,
      ]}
    >
      <Text style={{ color: LightColors.onInverseSurface, fontSize: 14 }}>
        {message}
      </Text>
    </Animated.View>
  );
});

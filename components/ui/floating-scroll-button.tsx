import { LightColors } from "@/constants/theme";
import { Pressable } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface FloatingScrollButtonProps {
  visible: boolean;
  onPress: () => void;
}

export function FloatingScrollButton({ visible, onPress }: FloatingScrollButtonProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(visible ? 1 : 0, { damping: 25, stiffness: 250 }),
    transform: [
      { scale: withSpring(visible ? 1 : 0, { damping: 25, stiffness: 250 }) },
    ],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          position: "absolute",
          right: 16,
          bottom: 24,
          zIndex: 999,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        className="active:opacity-70"
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: LightColors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        <Ionicons name="arrow-up" size={24} color="white" />
      </Pressable>
    </Animated.View>
  );
}

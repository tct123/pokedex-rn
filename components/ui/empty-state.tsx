import React from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  View,
} from "react-native";
import { TextColors } from "@/constants/theme";

interface EmptyStateProps {
  title: string;
  message: string;
  image: ImageSourcePropType;
  className?: string;
}

export const EmptyState = React.memo(function EmptyState({
  title,
  message,
  image,
  className,
}: EmptyStateProps) {
  return (
    <View className={`py-12 px-6 items-center ${className ?? ""}`}>
      <Image
        source={image}
        className="w-40 h-40 mb-4"
        resizeMode="contain"
      />
      <Text
        className="text-xl font-bold text-center mb-2"
        style={{ color: TextColors.black }}
      >
        {title}
      </Text>
      <Text
        className="text-sm text-center"
        style={{ color: TextColors.grey }}
      >
        {message}
      </Text>
    </View>
  );
});

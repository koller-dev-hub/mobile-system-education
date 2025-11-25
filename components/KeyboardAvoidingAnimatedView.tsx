import React, { useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  LayoutChangeEvent,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface KeyboardAvoidingAnimatedViewProps {
  children: React.ReactNode;
  behavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  enabled?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const KeyboardAvoidingAnimatedView = React.forwardRef<
  Animated.View,
  KeyboardAvoidingAnimatedViewProps
>((props, ref) => {
  const {
    children,
    behavior = Platform.OS === 'ios' ? 'padding' : 'height',
    keyboardVerticalOffset = 0,
    style,
    contentContainerStyle,
    enabled = true,
    onLayout,
    ...leftoverProps
  } = props;

  const animatedViewRef = useRef<{ y: number; height: number } | null>(null);
  const initialHeightRef = useRef(0);
  const bottomHeight = useSharedValue(0);

  useEffect(() => {
    if (!enabled) return;

    const onKeyboardShow = (event: KeyboardEvent) => {
      const { duration, endCoordinates } = event;
      const animatedView = animatedViewRef.current;

      if (!animatedView) return;

      // calculate how much the view needs to move up
      const keyboardY = endCoordinates.screenY - keyboardVerticalOffset;
      const height = Math.max(
        animatedView.y + animatedView.height - keyboardY,
        0
      );

      bottomHeight.value = withTiming(height, {
        duration: duration > 10 ? duration : 300,
      });
    };

    const onKeyboardHide = (event: KeyboardEvent) => {
      const { duration } = event;
      bottomHeight.value = withTiming(0, {
        duration: duration > 10 ? duration : 300,
      });
    };

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showListener = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideListener = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [keyboardVerticalOffset, enabled, bottomHeight]);

  const animatedStyle = useAnimatedStyle(() => {
    if (behavior === 'height') {
      return {
        height: initialHeightRef.current - bottomHeight.value,
        flex: bottomHeight.value > 0 ? 0 : undefined,
      };
    }
    if (behavior === 'padding') {
      return {
        paddingBottom: bottomHeight.value,
      };
    }
    return {};
  });

  const positionAnimatedStyle = useAnimatedStyle(() => ({
    bottom: bottomHeight.value,
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    animatedViewRef.current = layout;

    if (!initialHeightRef.current) {
      initialHeightRef.current = layout.height;
    }

    if (onLayout) {
      onLayout(event);
    }
  };

  const renderContent = () => {
    if (behavior === 'position') {
      return (
        <Animated.View style={[contentContainerStyle, positionAnimatedStyle]}>
          {children}
        </Animated.View>
      );
    }
    return children;
  };

  if (Platform.OS === 'web') {
    return (
      <KeyboardAvoidingView
        behavior={behavior}
        style={style}
        contentContainerStyle={contentContainerStyle}
        {...leftoverProps}
      >
        {children}
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View
      ref={ref}
      style={[style, animatedStyle]}
      onLayout={handleLayout}
      {...leftoverProps}
    >
      {renderContent()}
    </Animated.View>
  );
});

KeyboardAvoidingAnimatedView.displayName = 'KeyboardAvoidingAnimatedView';

export default KeyboardAvoidingAnimatedView;

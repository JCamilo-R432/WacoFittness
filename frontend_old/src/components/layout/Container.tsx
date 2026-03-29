import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SPACING } from '../../utils/constants';

interface ContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  padding?: boolean;
}

const Container: React.FC<ContainerProps> = ({ children, scroll = true, style, padding = true }) => {
  if (scroll) {
    return (
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={[padding && styles.padding]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <>{children}</>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  padding: { padding: SPACING.md, paddingBottom: SPACING.xxl },
});

export default React.memo(Container);

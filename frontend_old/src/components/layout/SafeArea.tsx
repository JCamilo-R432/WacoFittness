import React from 'react';
import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../utils/constants';

interface SafeAreaProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

const SafeArea: React.FC<SafeAreaProps> = ({ children, style }) => {
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});

export default React.memo(SafeArea);

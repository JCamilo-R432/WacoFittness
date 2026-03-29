import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../utils/constants';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title, subtitle, onBack, rightIcon, onRightPress, rightComponent, transparent = false,
}) => {
  return (
    <View style={[styles.container, transparent && styles.transparent]}>
      <StatusBar barStyle={transparent ? 'light-content' : 'dark-content'} />
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-left" size={24} color={transparent ? COLORS.white : COLORS.dark} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.center}>
        <Text style={[styles.title, transparent && styles.titleWhite]} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {rightComponent}
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name={rightIcon} size={24} color={transparent ? COLORS.white : COLORS.dark} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    minHeight: 56,
  },
  transparent: { backgroundColor: 'transparent' },
  left: { width: 40 },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 40, alignItems: 'flex-end' },
  backBtn: { padding: 4 },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.dark },
  titleWhite: { color: COLORS.white },
  subtitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray, marginTop: 2 },
});

export default React.memo(Header);

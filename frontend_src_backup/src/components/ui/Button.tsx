import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'medium',
  disabled = false, loading = false, icon, iconPosition = 'left',
  fullWidth = false, style, textStyle, accessibilityLabel,
}) => {
  const isDisabled = disabled || loading;

  const containerStyle = [
    styles.base,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.label,
    styles[`label_${variant}`],
    styles[`labelSize_${size}`],
    isDisabled && styles.labelDisabled,
    textStyle,
  ];

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const iconColor =
    variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyle}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon name={icon} size={iconSize} color={iconColor} style={styles.iconLeft} />
          )}
          <Text style={labelStyle}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Icon name={icon} size={iconSize} color={iconColor} style={styles.iconRight} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  variant_primary: { backgroundColor: COLORS.primary },
  variant_secondary: { backgroundColor: COLORS.secondary },
  variant_outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: COLORS.primary },
  variant_danger: { backgroundColor: COLORS.danger },
  variant_ghost: { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },

  // Sizes
  size_small: { paddingVertical: SPACING.xs + 2, paddingHorizontal: SPACING.md },
  size_medium: { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.lg },
  size_large: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl },

  // Labels
  label: { fontFamily: FONTS.semiBold, textAlign: 'center' },
  label_primary: { color: COLORS.white },
  label_secondary: { color: COLORS.white },
  label_outline: { color: COLORS.primary },
  label_danger: { color: COLORS.white },
  label_ghost: { color: COLORS.primary },
  labelDisabled: { opacity: 0.7 },
  labelSize_small: { fontSize: FONT_SIZES.sm },
  labelSize_medium: { fontSize: FONT_SIZES.base },
  labelSize_large: { fontSize: FONT_SIZES.lg },

  // Icons
  iconLeft: { marginRight: SPACING.xs },
  iconRight: { marginLeft: SPACING.xs },
});

export default React.memo(Button);

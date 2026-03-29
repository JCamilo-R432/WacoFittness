import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
}

const Input: React.FC<InputProps> = ({
  label, value, onChangeText, placeholder, secureTextEntry = false,
  error, icon, rightIcon, onRightIconPress, disabled = false,
  multiline = false, numberOfLines = 1, containerStyle,
  accessibilityLabel, ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const borderColor = error ? COLORS.danger : isFocused ? COLORS.primary : COLORS.lightGray;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor }, disabled && styles.disabled]}>
        {icon && (
          <Icon name={icon} size={20} color={isFocused ? COLORS.primary : COLORS.gray} style={styles.leftIcon} />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.mediumGray}
          secureTextEntry={isSecure}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            multiline && styles.multiline,
          ]}
          accessibilityLabel={accessibilityLabel ?? label}
          {...rest}
        />
        {secureTextEntry && (
          <Icon
            name={isSecure ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={COLORS.gray}
            style={styles.rightIcon}
            onPress={() => setIsSecure(!isSecure)}
          />
        )}
        {rightIcon && !secureTextEntry && (
          <Icon
            name={rightIcon}
            size={20}
            color={COLORS.gray}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  labelError: { color: COLORS.danger },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    color: COLORS.dark,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  inputWithLeftIcon: { paddingLeft: 0 },
  inputWithRightIcon: { paddingRight: 0 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  leftIcon: { marginLeft: SPACING.md },
  rightIcon: { marginRight: SPACING.md, padding: SPACING.xs },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
  disabled: { opacity: 0.5, backgroundColor: COLORS.lighterGray },
});

export default React.memo(Input);

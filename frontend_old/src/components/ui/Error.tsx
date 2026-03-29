import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/constants';

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
  icon?: string;
  fullScreen?: boolean;
}

const Error: React.FC<ErrorProps> = ({
  message = 'Ha ocurrido un error', onRetry,
  icon = 'alert-circle-outline', fullScreen = false,
}) => {
  const content = (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={48} color={COLORS.danger} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Icon name="refresh" size={18} color={COLORS.white} />
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return fullScreen ? <View style={styles.fullScreenWrapper}>{content}</View> : content;
};

const styles = StyleSheet.create({
  fullScreenWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  fullScreen: { flex: 0 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.danger + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  message: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
});

export default React.memo(Error);

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

import SafeArea from './SafeArea';
import Header from './Header';
import Container from './Container';
import { COLORS } from '../../utils/constants';
import { useOffline } from '../../hooks/useOffline';

interface ScreenProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  scroll?: boolean;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
  contentStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  title,
  subtitle,
  children,
  scroll = true,
  onBack,
  rightIcon,
  onRightPress,
  contentStyle,
}) => {
  const { isOnline } = useOffline();
  return (
    <SafeArea style={styles.safe}>
      <Header title={title} subtitle={subtitle} onBack={onBack} rightIcon={rightIcon} onRightPress={onRightPress} />
      {isOnline === false && (
        <View style={styles.offline}>
          <Text style={styles.offlineText}>Sin conexión. Algunas funciones pueden no estar disponibles.</Text>
        </View>
      )}
      <Container scroll={scroll} style={contentStyle}>
        {children}
      </Container>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  safe: { backgroundColor: COLORS.background },
  offline: { backgroundColor: COLORS.warning + '20', padding: 10 },
  offlineText: { color: COLORS.dark, fontWeight: '600' },
});

export default React.memo(Screen);


import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { CopyButton } from './CopyButton';

interface ToolbarProps {
  code: string;
  showCopyButton?: boolean;
  onCopy?: (text: string) => void;
  style?: ViewStyle;
  children?: React.ReactNode;
}

/**
 * Optional toolbar for the syntax highlighter.
 * Can include copy button and other controls.
 */
export const Toolbar = memo<ToolbarProps>(
  ({ code, showCopyButton = true, onCopy, style, children }) => {
    return (
      <View style={[styles.container, style]}>
        {children}
        {showCopyButton && <CopyButton text={code} onCopy={onCopy} />}
      </View>
    );
  }
);

Toolbar.displayName = 'Toolbar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
});

import { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Clipboard,
} from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

interface CopyButtonProps {
  text: string;
  onCopy?: (text: string) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  label?: string;
}

/**
 * Copy button component for copying code to clipboard.
 */
export const CopyButton = memo<CopyButtonProps>(
  ({ text, onCopy, style, textStyle, label = 'Copy' }) => {
    const handleCopy = useCallback(() => {
      try {
        Clipboard.setString(text);
        onCopy?.(text);
        Alert.alert('Copied!', 'Code copied to clipboard');
      } catch {
        Alert.alert('Error', 'Failed to copy to clipboard');
      }
    }, [text, onCopy]);

    return (
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handleCopy}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, textStyle]}>{label}</Text>
      </TouchableOpacity>
    );
  }
);

CopyButton.displayName = 'CopyButton';

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {colors, spacing, borderRadius, fontSize} from '../theme/colors';
import CurrencyService from '../services/CurrencyService';

interface AddMoneyModalProps {
  visible: boolean;
  type: 'add' | 'subtract';
  onClose: () => void;
  onSubmit: (amount: number, note?: string) => void;
}

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  visible,
  type,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [currency, setCurrency] = useState<'RSD' | 'EUR'>('RSD');
  const [eurRate, setEurRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);

  useEffect(() => {
    if (!visible) {
      // Reset form when modal closes
      setAmount('');
      setNote('');
      setCurrency('RSD');
    } else {
      // Fetch EUR rate when modal opens
      fetchRate();
    }
  }, [visible]);

  const fetchRate = async () => {
    setLoadingRate(true);
    try {
      const rate = await CurrencyService.fetchEURRate();
      setEurRate(rate);
    } catch (error) {
      console.error('Error fetching rate:', error);
    } finally {
      setLoadingRate(false);
    }
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    // Convert EUR to RSD if needed
    let rsdAmount = numAmount;
    if (currency === 'EUR' && eurRate) {
      rsdAmount = CurrencyService.convertToRSD(numAmount, eurRate);
    }

    onSubmit(rsdAmount, note.trim() || undefined);
  };

  const isValid = amount.length > 0 && parseFloat(amount) > 0;

  // Calculate converted amount for preview
  const getConvertedAmount = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !eurRate) return null;

    if (currency === 'RSD') {
      return CurrencyService.convertToEUR(numAmount, eurRate);
    } else {
      return CurrencyService.convertToRSD(numAmount, eurRate);
    }
  };

  const convertedAmount = getConvertedAmount();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modal}>
          <Text style={styles.title}>
            {type === 'add' ? 'Add Money' : 'Subtract Money'}
          </Text>

          {/* Currency Toggle */}
          <View style={styles.currencyToggle}>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                currency === 'RSD' && styles.currencyButtonActive,
              ]}
              onPress={() => setCurrency('RSD')}>
              <Text
                style={[
                  styles.currencyButtonText,
                  currency === 'RSD' && styles.currencyButtonTextActive,
                ]}>
                RSD
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.currencyButton,
                currency === 'EUR' && styles.currencyButtonActive,
              ]}
              onPress={() => setCurrency('EUR')}>
              <Text
                style={[
                  styles.currencyButtonText,
                  currency === 'EUR' && styles.currencyButtonTextActive,
                ]}>
                EUR
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount ({currency})</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textDisabled}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            {/* Show conversion preview */}
            {amount && convertedAmount !== null && (
              <Text style={styles.conversionHint}>
                ≈ {currency === 'RSD' ? '€' : ''}
                {convertedAmount.toLocaleString('sr-RS', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {currency === 'RSD' ? '' : ' RSD'}
              </Text>
            )}
            {loadingRate && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.secondary} />
                <Text style={styles.loadingText}>Loading rate...</Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a note..."
              placeholderTextColor={colors.textDisabled}
              value={note}
              onChangeText={setNote}
              maxLength={100}
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                type === 'add' ? styles.addButton : styles.subtractButton,
                !isValid && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValid}>
              <Text style={styles.buttonText}>
                {type === 'add' ? 'Add' : 'Subtract'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '85%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  currencyButtonActive: {
    backgroundColor: colors.primary,
  },
  currencyButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  currencyButtonTextActive: {
    color: colors.text,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  conversionHint: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  loadingText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
  },
  addButton: {
    backgroundColor: colors.positive,
  },
  subtractButton: {
    backgroundColor: colors.negative,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default AddMoneyModal;

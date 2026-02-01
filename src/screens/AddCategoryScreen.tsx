import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, Category} from '../types';
import StorageService from '../services/StorageService';
import CurrencyService from '../services/CurrencyService';
import {colors, spacing, fontSize, borderRadius} from '../theme/colors';

type AddCategoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddCategory'
>;

interface AddCategoryScreenProps {
  navigation: AddCategoryScreenNavigationProp;
}

const AddCategoryScreen: React.FC<AddCategoryScreenProps> = ({navigation}) => {
  const [categoryName, setCategoryName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [currency, setCurrency] = useState<'RSD' | 'EUR'>('RSD');
  const [eurRate, setEurRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);

  useEffect(() => {
    fetchRate();
  }, []);

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

  const handleCreate = async () => {
    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    const balance = initialBalance.trim()
      ? parseFloat(initialBalance)
      : 0;

    if (isNaN(balance)) {
      Alert.alert('Error', 'Please enter a valid initial balance');
      return;
    }

    // Convert EUR to RSD if needed
    let rsdBalance = balance;
    if (currency === 'EUR' && eurRate) {
      rsdBalance = CurrencyService.convertToRSD(balance, eurRate);
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: trimmedName,
      balance: rsdBalance,
      transactions: rsdBalance !== 0 ? [{
        id: Date.now().toString(),
        amount: rsdBalance,
        type: 'add',
        timestamp: Date.now(),
        note: 'Initial balance',
      }] : [],
      createdAt: Date.now(),
    };

    await StorageService.addCategory(newCategory);
    navigation.goBack();
  };

  const isValid = categoryName.trim().length > 0;

  // Calculate converted amount for preview
  const getConvertedAmount = () => {
    const numAmount = parseFloat(initialBalance);
    if (isNaN(numAmount) || !eurRate || numAmount === 0) return null;

    if (currency === 'RSD') {
      return CurrencyService.convertToEUR(numAmount, eurRate);
    } else {
      return CurrencyService.convertToRSD(numAmount, eurRate);
    }
  };

  const convertedAmount = getConvertedAmount();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Category</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Cash, Savings, Investments"
            placeholderTextColor={colors.textDisabled}
            value={categoryName}
            onChangeText={setCategoryName}
            maxLength={50}
            autoFocus
          />
        </View>

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
          <Text style={styles.label}>Initial Balance ({currency})</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={colors.textDisabled}
            keyboardType="decimal-pad"
            value={initialBalance}
            onChangeText={setInitialBalance}
          />
          {initialBalance && convertedAmount !== null && (
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
          <Text style={styles.hint}>
            Leave empty or enter 0 to start with zero balance
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, !isValid && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!isValid}
          activeOpacity={0.8}>
          <Text style={styles.createButtonText}>Create Category</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  form: {
    padding: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
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
  hint: {
    fontSize: fontSize.xs,
    color: colors.textDisabled,
    marginTop: spacing.xs,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
});

export default AddCategoryScreen;

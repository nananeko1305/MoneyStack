import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import CurrencyService from '../services/CurrencyService';
import {colors, spacing, fontSize, borderRadius} from '../theme/colors';

interface CurrencyConverterProps {
  amount: number;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({amount}) => {
  const [eurAmount, setEurAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    fetchRate();
  }, [amount]);

  const fetchRate = async () => {
    try {
      setLoading(true);
      const fetchedRate = await CurrencyService.fetchEURRate();
      setRate(fetchedRate);
      const converted = CurrencyService.convertToEUR(amount, fetchedRate);
      setEurAmount(converted);
    } catch (error) {
      console.error('Error fetching rate:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.secondary} />
        <Text style={styles.loadingText}>Loading EUR rate...</Text>
      </View>
    );
  }

  if (!eurAmount || !rate) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to fetch EUR rate</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.conversionRow}>
        <Text style={styles.eurAmount}>
          €{eurAmount.toLocaleString('sr-RS', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <Text style={styles.rateText}>
          Rate: 1 EUR = {rate.toFixed(4)} RSD
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  conversionRow: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  eurAmount: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.secondary,
  },
  rateText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
  },
});

export default CurrencyConverter;

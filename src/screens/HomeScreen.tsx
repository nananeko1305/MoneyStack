import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {Category, RootStackParamList} from '../types';
import CategoryCard from '../components/CategoryCard';
import StorageService from '../services/StorageService';
import CurrencyService from '../services/CurrencyService';
import {colors, spacing, fontSize, borderRadius} from '../theme/colors';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [showTotalInEUR, setShowTotalInEUR] = useState(false);
  const [eurRate, setEurRate] = useState<number | null>(null);

  const loadCategories = useCallback(async () => {
    const loaded = await StorageService.getCategories();
    setCategories(loaded);

    const total = loaded.reduce((sum, cat) => sum + cat.balance, 0);
    setTotalBalance(total);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  useEffect(() => {
    // Initialize currency cache on mount and fetch rate
    const initializeCurrency = async () => {
      await CurrencyService.initializeCache();
      const rate = await CurrencyService.fetchEURRate();
      setEurRate(rate);
    };
    initializeCurrency();
  }, []);

  const handleUpdateCategory = useCallback(async (updatedCategory: Category) => {
    await StorageService.updateCategory(updatedCategory.id, updatedCategory);
    loadCategories();
  }, [loadCategories]);

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    await StorageService.deleteCategory(categoryId);
    loadCategories();
  }, [loadCategories]);

  const renderCategory = useCallback(
    ({item}: {item: Category}) => (
      <CategoryCard
        category={item}
        onUpdate={handleUpdateCategory}
        onDelete={handleDeleteCategory}
      />
    ),
    [handleUpdateCategory, handleDeleteCategory],
  );

  const keyExtractor = useCallback((item: Category) => item.id, []);

  const renderHeader = () => {
    const eurTotal = eurRate ? CurrencyService.convertToEUR(totalBalance, eurRate) : null;

    return (
      <View style={styles.header}>
        <Text style={styles.title}>Money Stack</Text>
        <View style={styles.totalContainer}>
          <View style={styles.totalHeader}>
            <Text style={styles.totalLabel}>Total Balance</Text>
            <TouchableOpacity
              onPress={() => setShowTotalInEUR(!showTotalInEUR)}
              style={styles.currencySwapButton}
              activeOpacity={0.7}>
              <Text style={[
                styles.currencySwapText,
                !showTotalInEUR && styles.currencySwapTextActive
              ]}>
                RSD
              </Text>
              <Text style={styles.swapIcon}>⇄</Text>
              <Text style={[
                styles.currencySwapText,
                showTotalInEUR && styles.currencySwapTextActive
              ]}>
                EUR
              </Text>
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.totalAmount,
              {color: totalBalance >= 0 ? colors.positive : colors.negative},
            ]}>
            {showTotalInEUR && eurTotal !== null ? (
              `€${Math.round(eurTotal).toLocaleString('sr-RS')}`
            ) : (
              `${Math.round(totalBalance).toLocaleString('sr-RS')} RSD`
            )}
          </Text>

          {showTotalInEUR && eurTotal !== null && (
            <Text style={styles.totalSecondary}>
              ≈ {Math.round(totalBalance).toLocaleString('sr-RS')} RSD
            </Text>
          )}

          {!showTotalInEUR && eurTotal !== null && (
            <Text style={styles.totalSecondary}>
              ≈ €{Math.round(eurTotal).toLocaleString('sr-RS')}
            </Text>
          )}

          {eurRate && (
            <Text style={styles.exchangeRateText}>
              1 EUR = {eurRate.toFixed(2)} RSD
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No categories yet</Text>
      <Text style={styles.emptySubtext}>
        Tap the + button to create your first category
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.background}
      />

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCategory')}
        activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  totalContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  currencySwapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  currencySwapText: {
    fontSize: fontSize.xs,
    color: colors.textDisabled,
    fontWeight: '600',
  },
  currencySwapTextActive: {
    color: colors.secondary,
    fontWeight: '700',
  },
  swapIcon: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  totalAmount: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  totalSecondary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  exchangeRateText: {
    fontSize: fontSize.xs,
    color: colors.textDisabled,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textDisabled,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabText: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '300',
  },
});

export default HomeScreen;

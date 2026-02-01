import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { Category } from '../types';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import AddMoneyModal from './AddMoneyModal';
import CurrencyConverter from './CurrencyConverter';

interface CategoryCardProps {
  category: Category;
  onUpdate: (category: Category) => void;
  onDelete: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = memo(
  ({ category, onUpdate, onDelete }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showConverter, setShowConverter] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'subtract'>('add');

    const isPositive = category.balance >= 0;

    const handleAddMoney = (amount: number, note?: string) => {
      const newTransaction = {
        id: Date.now().toString(),
        amount,
        type: 'add' as const,
        timestamp: Date.now(),
        note,
      };

      const updatedCategory: Category = {
        ...category,
        balance: category.balance + amount,
        transactions: [...category.transactions, newTransaction],
      };

      onUpdate(updatedCategory);
      setShowAddModal(false);
    };

    const handleSubtractMoney = (amount: number, note?: string) => {
      const newTransaction = {
        id: Date.now().toString(),
        amount,
        type: 'subtract' as const,
        timestamp: Date.now(),
        note,
      };

      const updatedCategory: Category = {
        ...category,
        balance: category.balance - amount,
        transactions: [...category.transactions, newTransaction],
      };

      onUpdate(updatedCategory);
      setShowAddModal(false);
    };

    const handleDelete = () => {
      const transactionCount = category.transactions.length;
      const balanceInfo =
        category.balance !== 0
          ? `\n\nCurrent balance: ${category.balance.toLocaleString('sr-RS', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} RSD`
          : '';

      Alert.alert(
        'Delete Category?',
        `Are you sure you want to delete "${
          category.name
        }"?${balanceInfo}\n\nThis will delete ${transactionCount} transaction${
          transactionCount !== 1 ? 's' : ''
        }.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(category.id),
          },
        ],
        { cancelable: true },
      );
    };

    const openAddModal = () => {
      setModalType('add');
      setShowAddModal(true);
    };

    const openSubtractModal = () => {
      setModalType('subtract');
      setShowAddModal(true);
    };

    return (
      <Pressable
        onLongPress={handleDelete}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.header}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setShowConverter(!showConverter)}
              style={styles.converterButton}
            >
              <Text style={styles.converterButtonText}>
                {showConverter ? 'Hide EUR' : 'Show EUR'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.balanceContainer}>
          <Text
            style={[
              styles.balance,
              { color: isPositive ? colors.positive : colors.negative },
            ]}
          >
            {Math.round(category.balance).toLocaleString('sr-RS')} RSD
          </Text>
        </View>

        {showConverter && <CurrencyConverter amount={category.balance} />}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={openAddModal}
          >
            <Text style={styles.actionButtonText}>+ Add</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.subtractButton]}
            onPress={openSubtractModal}
          >
            <Text style={styles.actionButtonText}>- Subtract</Text>
          </TouchableOpacity>
        </View>

        <AddMoneyModal
          visible={showAddModal}
          type={modalType}
          onClose={() => setShowAddModal(false)}
          onSubmit={modalType === 'add' ? handleAddMoney : handleSubtractMoney}
        />
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardPressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  converterButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.sm,
  },
  converterButtonText: {
    fontSize: fontSize.xs,
    color: colors.secondary,
    fontWeight: '500',
  },
  deleteButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '300',
    lineHeight: 18,
  },
  balanceContainer: {
    marginVertical: spacing.md,
  },
  balance: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: colors.positive,
  },
  subtractButton: {
    backgroundColor: colors.negative,
  },
  actionButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});

export default CategoryCard;

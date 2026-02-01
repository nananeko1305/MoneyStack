import AsyncStorage from '@react-native-async-storage/async-storage';
import {Category, ExchangeRate} from '../types';

class StorageService {
  private readonly CATEGORIES_KEY = 'categories';
  private readonly EUR_RATE_KEY = 'eur_rate';

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const categoriesJson = await AsyncStorage.getItem(this.CATEGORIES_KEY);
      return categoriesJson ? JSON.parse(categoriesJson) : [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async saveCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  }

  async addCategory(category: Category): Promise<void> {
    const categories = await this.getCategories();
    categories.push(category);
    await this.saveCategories(categories);
  }

  async updateCategory(categoryId: string, updatedCategory: Category): Promise<void> {
    const categories = await this.getCategories();
    const index = categories.findIndex(cat => cat.id === categoryId);
    if (index !== -1) {
      categories[index] = updatedCategory;
      await this.saveCategories(categories);
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const categories = await this.getCategories();
    const filtered = categories.filter(cat => cat.id !== categoryId);
    await this.saveCategories(filtered);
  }

  async getCategoryById(categoryId: string): Promise<Category | undefined> {
    const categories = await this.getCategories();
    return categories.find(cat => cat.id === categoryId);
  }

  // Exchange Rate
  async getExchangeRate(): Promise<ExchangeRate | null> {
    try {
      const rateJson = await AsyncStorage.getItem(this.EUR_RATE_KEY);
      return rateJson ? JSON.parse(rateJson) : null;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return null;
    }
  }

  async saveExchangeRate(rate: ExchangeRate): Promise<void> {
    try {
      await AsyncStorage.setItem(this.EUR_RATE_KEY, JSON.stringify(rate));
    } catch (error) {
      console.error('Error saving exchange rate:', error);
    }
  }

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }
}

export default new StorageService();

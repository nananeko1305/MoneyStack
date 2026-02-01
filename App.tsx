import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './src/types';
import HomeScreen from './src/screens/HomeScreen';
import AddCategoryScreen from './src/screens/AddCategoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddCategory" component={AddCategoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AddKhataBookScreen from '../screens/AddKhataBookScreen';
import KhataBookScreen from '../screens/KhataBookScreen';
import AddNewCustomerScreen from '../screens/AddNewCustomerScreen';
import CustomerScreen from '../screens/CustomerScreen';
import CreditDebitScreen from '../screens/CreditDebitScreen';
import EntryDetailsScreen from '../screens/EntryDetailsScreen';
import ImagePreviewScreen from '../screens/ImagePreviewScreen';

import Colors from '../constants/colors';

const defaultNavigationConfig = {
  headerStyle: {
    backgroundColor: Colors.headerColor,
  },
  headerTintColor: 'white',
  headerTitleStyle: {
    fontFamily: 'OpenSans-Bold',
  },
};

const stackNavigator = createStackNavigator(
  {
    Home: HomeScreen,
    AddKhataBook: AddKhataBookScreen,
    KhataBook: KhataBookScreen,
    AddNewCustomer: AddNewCustomerScreen,
    CustomerScreen: CustomerScreen,
    CreditDebitScreen: CreditDebitScreen,
    EntryDetailsScreen: EntryDetailsScreen,
    ImagePreviewScreen: ImagePreviewScreen,
  },
  {defaultNavigationOptions: defaultNavigationConfig},
);

const LoginNavigator = createStackNavigator(
  {
    Login: LoginScreen,
  },
  {defaultNavigationOptions: defaultNavigationConfig},
);

const rootNavigator = createSwitchNavigator({
  Splash: SplashScreen,
  Login: LoginNavigator,
  stackNavigator: stackNavigator,
});

export default createAppContainer(rootNavigator);

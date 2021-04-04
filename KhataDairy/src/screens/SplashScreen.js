import React, {useEffect} from 'react';
import {View, StyleSheet, ImageBackground} from 'react-native';
import auth from '@react-native-firebase/auth';

const SplashScreen = props => {
  useEffect(() => {
    let unsubscribe;
    let interval = setInterval(() => {
      unsubscribe = auth().onAuthStateChanged(user => {
        if (user && user.displayName) {
          props.navigation.navigate('stackNavigator');
        } else {
          props.navigation.navigate('Login');
        }
      });
    }, 1500);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.screen}>
      <ImageBackground
        source={require('../assets/images/maa.png')}
        style={{
          flex: 1,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
export default SplashScreen;

import React, {useReducer, useCallback, useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  ToastAndroid,
} from 'react-native';
import Input from '../components/Input';
import Card from '../components/Card';
import Colors from '../constants/colors';
import {getLocalizedText} from '../localization/config';
import auth from '@react-native-firebase/auth';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';
const formReducer = (state, action) => {
  switch (action.type) {
    case FORM_INPUT_UPDATE:
      const updatedInputs = {
        ...state.inputValues,
        [action.input]: action.value,
      };
      const updatedValidities = {
        ...state.inputValidities,
        [action.input]: action.isValid,
      };
      let formIsValid = true;
      for (let key in updatedValidities) {
        formIsValid = formIsValid && updatedValidities[key];
      }
      return {
        inputValues: updatedInputs,
        inputValidities: updatedValidities,
        formIsValid: formIsValid,
      };
    default:
      return state;
  }
};

const LoginScreen = props => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formState, formDispatch] = useReducer(formReducer, {
    inputValues: {
      email: '',
      pass: '',
    },
    inputValidities: {
      email: false,
      pass: false,
    },
    formIsValid: false,
  });

  const textChangedHandler = useCallback(
    (inputIdentifier, text, isValid) => {
      formDispatch({
        type: FORM_INPUT_UPDATE,
        value: text,
        input: inputIdentifier,
        isValid: isValid,
      });
    },
    [formDispatch],
  );

  const forgotPass = email => {
    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        ToastAndroid.showWithGravityAndOffset(
          getLocalizedText('Login.PassResetEmail'),
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
      })
      .catch(err => {
        ToastAndroid.showWithGravityAndOffset(
          getLocalizedText('Login.PassResetEmailFail'),
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
      });
  };
  const registerUser = () => {
    if (isSignUp) {
      setIsLoading(true);
      setError(null);
      auth()
        .createUserWithEmailAndPassword(
          formState.inputValues.email,
          formState.inputValues.pass,
        )
        .then(res => {
          setIsLoading(false);
          ToastAndroid.showWithGravityAndOffset(
            getLocalizedText('Login.SignupSuccess'),
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
            25,
            50,
          );
        })
        .catch(error => {
          let errorCode = error.code;
          if (errorCode === 'auth/email-already-in-use') {
            setError(getLocalizedText('Login.EmailInUse'));
          } else {
            setError(error.message);
          }
          setIsLoading(false);
        });
    } else {
      setIsLoading(true);
      setError(null);
      auth()
        .signInWithEmailAndPassword(
          formState.inputValues.email,
          formState.inputValues.pass,
        )
        .then(res => {
          auth()
            .currentUser.updateProfile({
              displayName: formState.inputValues.email,
            })
            .catch(err => {
              setError(err.message);
              setIsLoading(false);
            });
          props.navigation.navigate('stackNavigator');
        })
        .catch(error => {
          let errorCode = error.code;
          if (errorCode === 'auth/wrong-password') {
            setError(getLocalizedText('Login.PassInvaild'));
          } else if (errorCode === 'auth/user-not-found') {
            setError(getLocalizedText('Login.EmailNotFound'));
          } else {
            setError(error.message);
          }
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (error) {
      ToastAndroid.showWithGravityAndOffset(
        error,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    }
  }, [error]);

  return (
    <View style={styles.container}>
      <Card style={styles.loginContainer}>
        <Input
          id="email"
          label={getLocalizedText('Login.E-mail')}
          KeyboardType="email-address"
          initialValid={true}
          required
          email
          autoCapitalize="none"
          errorText={getLocalizedText('Login.ValidEmail')}
          onInputChange={textChangedHandler}
          initialValue=""
        />

        <Input
          id="pass"
          label={getLocalizedText('Login.Password')}
          KeyboardType="default"
          initialValid={true}
          secureTextEntry={true}
          required
          minLength="8"
          errorText={getLocalizedText('Login.ValidPassword')}
          onInputChange={textChangedHandler}
          initialValue=""
        />
        <TouchableOpacity
          style={styles.forgotPass}
          disabled={
            String(formState.inputValues.email).length === 0 ? true : false
          }
          onPress={() => forgotPass(formState.inputValues.email)}>
          <Text
            style={{
              ...styles.forgotPassText,
              opacity:
                String(formState.inputValues.email).length === 0 ? 0.5 : 1,
            }}>
            {getLocalizedText('Login.ForgotPassword')}
          </Text>
        </TouchableOpacity>
      </Card>
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.headerColor} />
        ) : (
          <Button
            title={
              isSignUp
                ? getLocalizedText('Login.SignUp')
                : getLocalizedText('Login.title')
            }
            disabled={
              !formState.formIsValid ||
              !formState.inputValues.email ||
              !formState.inputValues.pass
            }
            color={Colors.headerColor}
            onPress={registerUser}
          />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={
            isSignUp
              ? getLocalizedText('Login.SwitchToLogin')
              : getLocalizedText('Login.SwitchToSignup')
          }
          color={Colors.headerColor}
          onPress={() => {
            setIsSignUp(prevState => !prevState);
          }}
        />
      </View>
    </View>
  );
};

LoginScreen.navigationOptions = ({navigate}) => {
  return {
    title: getLocalizedText('Login.title'),
  };
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginContainer: {
    width: '90%',
    backgroundColor: Colors.whiteColor,
    borderRadius: 10,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 10,
    width: '90%',
  },
  forgotPass: {
    alignItems: 'flex-end',
  },
  forgotPassText: {
    color: Colors.headerColor,
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
  },
});
export default LoginScreen;

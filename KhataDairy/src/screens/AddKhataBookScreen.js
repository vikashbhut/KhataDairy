import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ToastAndroid,
  Alert,
} from 'react-native';
import {OutlinedTextField} from 'react-native-material-textfield';
import Colors from '../constants/colors';
import {useDispatch} from 'react-redux';
import {addKhataBook} from '../store/actions/khatabook';
import colors from '../constants/colors';
import AppButton from '../components/AppButton';
import {useIsMountedRef} from '../utils/utils';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {getLocalizedText} from '../localization/config';
import {set} from 'react-native-reanimated';

const AddKhataBookScreen = props => {
  const [shopName, setShopName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState();
  const isMountedRef = useIsMountedRef();
  const [oldName, setOldName] = useState(props.navigation.getParam('edit'));

  const dispatch = useDispatch();

  const textChangedHandler = text => {
    let isValid = true;
    if (text.trim().length === 0) {
      isValid = false;
    }
    setIsValid(isValid);
    setShopName(text);
  };

  const func = () => {
    var khatabookref = database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`khatabooks`);
    var customerref = database()
      .ref()
      .child(`${auth().currentUser.uid.toString()}/customers`);
    khatabookref
      .orderByKey()
      .equalTo(shopName)
      .once('value', snap => {
        if (snap.val()) {
          setIsLoading(false);
          Alert.alert('', 'દુકાન / વ્યવસાયનું નામ પહેલાથી જ અસ્તિત્વમાં છે', [
            {text: 'Ok'},
          ]);
        } else {
          khatabookref
            .child(oldName)
            .once('value')
            .then(snap => {
              let khatabookdata = snap.val();
              if (khatabookdata) {
                khatabookdata.name = shopName;
                let updateKhataBook = {};
                updateKhataBook[oldName] = null;
                updateKhataBook[shopName] = khatabookdata;
                khatabookref.update(updateKhataBook).then(() => {
                  setOldName(shopName);
                });
              }
            })
            .catch(error => {
              setIsLoading(false);
              setError(error);
            });

          customerref
            .child(oldName)
            .once('value')
            .then(snap => {
              let data = snap.val();
              let update = {};
              update[oldName] = null;
              update[shopName] = data;
              customerref
                .update(update)
                .then(() => {
                  props.navigation.goBack();
                })
                .catch(error => {
                  setError(error);
                  setIsLoading(false);
                });
            });
        }
      });
  };
  const submitHandler = () => {
    let id = Date.now().toString();
    setIsLoading(true);
    setError(null);

    if (oldName) {
      func();
    } else {
      database()
        .ref()
        .child(auth().currentUser.uid.toString())
        .child(`khatabooks`)
        .orderByKey()
        .equalTo(shopName)
        .once('value', snap => {
          if (snap.val()) {
            setIsLoading(false);
            Alert.alert('', 'દુકાન / વ્યવસાયનું નામ પહેલાથી જ અસ્તિત્વમાં છે', [
              {text: 'Ok'},
            ]);
          } else {
            database()
              .ref()
              .child(auth().currentUser.uid.toString())
              .child(`khatabooks/${shopName}`)
              .set({
                id: id,
                name: shopName,
              })
              .then(res => {
                if (isMountedRef.current) {
                  setIsLoading(false);
                  dispatch(addKhataBook(shopName, id));
                  props.navigation.navigate('Home');
                }
              })
              .catch(err => {
                if (isMountedRef.current) {
                  setError(err.message);
                  setIsLoading(false);
                }
              });
          }
        });
    }
  };

  useEffect(() => {
    if (error) {
      ToastAndroid.showWithGravityAndOffset(
        error,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    }
  }, [error]);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <View style={styles.inputContainer}>
        <OutlinedTextField
          label={getLocalizedText('entershopname')}
          autoCapitalize="none"
          spellCheck={false}
          autoCorrect={false}
          clearTextOnFocus={true}
          onChangeText={textChangedHandler}
          tintColor={colors.headerColor}
        />
      </View>
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.headerColor} />
        ) : (
          <AppButton
            title={getLocalizedText('submit')}
            onPress={submitHandler}
            disabled={!isValid}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

AddKhataBookScreen.navigationOptions = ({navigation}) => {
  return {
    title: navigation.getParam('title')
      ? navigation.getParam('title')
      : 'Add Khata Book',
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    width: '90%',
  },
  buttonContainer: {
    width: '30%',
  },
});
export default AddKhataBookScreen;

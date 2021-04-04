import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {OutlinedTextField} from 'react-native-material-textfield';
import AppButton from '../components/AppButton';
import colors from '../constants/colors';
import {useDispatch} from 'react-redux';
import {addCustomer} from '../store/actions/khatabook';
import {useIsMountedRef} from '../utils/utils';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {getLocalizedText} from '../localization/config';
import KhataBook from '../models/KhataBook';

const AddNewCustomerScreen = props => {
  const [value, setValue] = useState();
  const [valid, setValid] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useIsMountedRef();
  const [oldName, setOldName] = useState(props.navigation.getParam('edit'));

  const dispatch = useDispatch();

  const textChangeHandler = text => {
    let isValid = true;
    if (text.trim().length === 0) {
      isValid = false;
    }
    setValid(isValid);
    setValue(text);
  };

  const func = () => {
    let customerref = database()
      .ref()
      .child(
        `${auth().currentUser.uid.toString()}/customers/${props.navigation.getParam(
          'khatabookname',
        )}`,
      );
    customerref
      .orderByKey()
      .equalTo(value)
      .once('value', snap => {
        if (snap.val()) {
          setIsLoading(false);
          Alert.alert('', 'ગ્રાહકનું નામ પહેલેથી જ અસ્તિત્વમાં છે', [
            {text: 'Ok'},
          ]);
        } else {
          customerref
            .child(oldName)
            .once('value')
            .then(snap => {
              let data = snap.val();
              setIsLoading(false);
              setError(null);
              if (data) {
                let update = {};
                data.name = value;
                update[oldName] = null;
                update[value] = data;
                customerref.update(update).then(() => {
                  props.navigation.navigate('KhataBook');
                });
              } else {
                props.navigation.goBack('KhataBook');
              }
            })
            .catch(error => {
              setIsLoading(false);
              setError(error);
            });
        }
      });
  };
  const submitHandler = () => {
    let customerId = Date.now().toString();
    let date = Date.now();
    setIsLoading(true);
    setError(null);
    let oldName = props.navigation.getParam('edit');
    if (oldName) {
      func();
    } else {
      database()
        .ref()
        .child(auth().currentUser.uid.toString())
        .child(`customers/${props.navigation.getParam('khatabookname')}`)
        .orderByKey()
        .equalTo(value)
        .once('value', snap => {
          if (snap.val()) {
            setIsLoading(false);
            Alert.alert('', 'ગ્રાહકનું નામ પહેલેથી જ અસ્તિત્વમાં છે', [
              {text: 'Ok'},
            ]);
          } else {
            database()
              .ref()
              .child(auth().currentUser.uid.toString())
              .child(
                `customers/${props.navigation.getParam(
                  'khatabookname',
                )}/${value}`,
              )
              .set({
                id: customerId,
                name: value,
                entries: [],
                totalGave: 0,
                totalGot: 0,
                date: date,
              })
              .then(() => {
                if (isMountedRef.current) {
                  setIsLoading(false);
                  dispatch(addCustomer(customerId, value, date));
                  props.navigation.goBack();
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
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
        25,
        50,
      );
    }
  }, [error]);

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <OutlinedTextField
          label={getLocalizedText('custname')}
          clearTextOnFocus={true}
          autoCorrect={false}
          spellCheck={false}
          value={value}
          onChangeText={textChangeHandler}
          tintColor={colors.headerColor}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.headerColor} />
        ) : (
          <AppButton
            title={getLocalizedText('save')}
            disabled={!valid}
            onPress={submitHandler}
          />
        )}
      </View>
    </View>
  );
};

AddNewCustomerScreen.navigationOptions = ({navigation}) => {
  return {
    title: navigation.getParam('edit')
      ? 'Edit CustomerName'
      : 'Add New Customer',
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 50,
  },
});

export default AddNewCustomerScreen;

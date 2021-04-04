import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Image,
  ActivityIndicator,
} from 'react-native';
import colors from '../constants/colors';
import {OutlinedTextField} from 'react-native-material-textfield';
import AppButton from '../components/AppButton';
import Icon from 'react-native-vector-icons/EvilIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImagePicker from 'react-native-image-picker';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import 'moment/locale/gu';
import {getLocalizedText} from '../localization/config';
moment.locale('gu');

const CreditDebitScreen = props => {
  const item = props.navigation.getParam('data').items;
  const [amount, setAmount] = useState(item ? item.amount : null);
  const [details, setDetails] = useState(item ? item.details : null);
  const [date, setDate] = useState(item ? new Date(item.date) : new Date());
  const [show, setShow] = useState(false);
  const [uploadUri, setuploadUri] = useState(item ? item.imagePath : null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const color = props.navigation.getParam('data').color;
  const isGave = color === colors.red ? true : false;
  const isGot = color === colors.green ? true : false;
  const khatabookname = props.navigation.getParam('data').khatabookname;
  const name = props.navigation.getParam('data').profile;
  const edit = props.navigation.getParam('data').edit;

  const currentTotalGaveAndGot = () => {
    return database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`customers/${khatabookname}/${name}`)
      .once('value')
      .then(res => {
        let totalGave = res.child('totalGave').val();
        let totalGot = res.child('totalGot').val();

        if (isGave && amount) {
          totalGot =
            totalGot + Number(amount) - totalGave > 0
              ? totalGot + Number(amount) - totalGave
              : 0;
          if (totalGave - Number(amount) <= 0) {
            totalGave = 0;
          } else {
            totalGave = totalGave - Number(amount);
          }
        } else if (isGot && amount) {
          totalGave =
            totalGave + Number(amount) - totalGot > 0
              ? totalGave + Number(amount) - totalGot
              : 0;
          if (totalGot - Number(amount) <= 0) {
            totalGot = 0;
          } else {
            totalGot = totalGot - Number(amount);
          }
        }
        return {
          totalGave: totalGave,
          totalGot: totalGot,
        };
      });
  };

  const updateTotalGaveAndGot = async key => {
    const updatedTotal = await currentTotalGaveAndGot();
    database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`customers/${khatabookname}/${name}`)
      .update({
        totalGave: updatedTotal.totalGave,
        totalGot: updatedTotal.totalGot,
      });

    database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`customers/${khatabookname}/${name}/entries/${key}`)
      .update({
        gave: updatedTotal.totalGave,
        got: updatedTotal.totalGot,
      })
      .then(() => {
        props.navigation.navigate('CustomerScreen');
        setIsLoading(false);
        setError(null);
      })
      .catch(error => {
        setError(error);
        setIsLoading(false);
      });
  };

  const dataAfterUpdate = () => {
    return database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`customers/${khatabookname}/${name}/entries`)
      .once('value')
      .then(res => {
        if (res) {
          let data;

          let totalGot = 0;
          let totalGave = 0;

          for (let key in res) {
            if (key === '_snapshot') {
              let obj = res[key];
              data = obj['value'];
            }
          }

          if (data) {
            Object.values(data)
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
              .forEach(item => {
                if (item.isGave && item.amount) {
                  totalGot =
                    totalGot + Number(item.amount) - totalGave > 0
                      ? totalGot + Number(item.amount) - totalGave
                      : 0;
                  if (totalGave - Number(item.amount) <= 0) {
                    totalGave = 0;
                  } else {
                    totalGave = totalGave - Number(item.amount);
                  }
                } else if (item.isGot && item.amount) {
                  totalGave =
                    totalGave + Number(item.amount) - totalGot > 0
                      ? totalGave + Number(item.amount) - totalGot
                      : 0;
                  if (totalGot - Number(item.amount) <= 0) {
                    totalGot = 0;
                  } else {
                    totalGot = totalGot - Number(item.amount);
                  }
                }
                item.gave = totalGave;
                item.got = totalGot;
              });
          }
          return {data: data, totalGave: totalGave, totalGot: totalGot};
        }
      });
  };

  const updatedData = async () => {
    const newData = await dataAfterUpdate();
    if (newData.data) {
      database()
        .ref()
        .child(auth().currentUser.uid.toString())
        .child(`customers/${khatabookname}/${name}/entries`)
        .set(newData.data)
        .then(() => {
          setIsLoading(false);
          setError(null);
          database()
            .ref()
            .child(auth().currentUser.uid.toString())
            .child(`customers/${khatabookname}/${name}`)
            .update({
              totalGave: newData.totalGave,
              totalGot: newData.totalGot,
            });
          props.navigation.navigate('CustomerScreen');
        })
        .catch(error => {
          setError(error);
          setIsLoading(false);
        });
    }
  };
  const submitHandler = () => {
    setIsLoading(true);
    setError(null);

    if (edit) {
      database()
        .ref()
        .child(auth().currentUser.uid.toString())
        .child(`customers/${khatabookname}/${name}/entries/${item.id}`)
        .update({
          amount: amount,
          details: details,
          date: date.toISOString(),
          imagePath: uploadUri,
          isGave: isGave,
          isGot: isGot,
          gave: 0,
          got: 0,
        });
      updatedData();
    } else {
      const ref = database()
        .ref()
        .child(auth().currentUser.uid.toString())
        .child(`customers/${khatabookname}/${name}/entries`)
        .push({
          amount: amount,
          details: details,
          date: date.toISOString(),
          imagePath: uploadUri,
          isGave: isGave,
          isGot: isGot,
          gave: 0,
          got: 0,
          timestamp: Date.now(),
        });
      updateTotalGaveAndGot(ref.key);
    }
  };

  const amountChangedHandler = text => {
    setAmount(text.trim());
  };

  const detailsChangedHandler = text => {
    setDetails(text.trim());
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
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
  //Image Picker

  const options = {
    title: 'Select Photo',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const showImagePicker = () => {
    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        ToastAndroid.showWithGravityAndOffset(
          'User Cancelled Image Picker',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
          25,
          50,
        );
      } else if (response.error) {
        setError(response.error);
      } else {
        const uri = response.uri;
        setuploadUri(uri);
      }
    });
  };

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={color}
        style={{alignItems: 'center', justifyContent: 'center', flex: 1}}
      />
    );
  } else {
    return (
      <View style={styles.screen}>
        <OutlinedTextField
          label={getLocalizedText('enteramount')}
          prefix={'₹'}
          autoCorrect={false}
          spellCheck={false}
          keyboardType="number-pad"
          value={amount}
          onChangeText={amountChangedHandler}
          color={color}
          containerStyle={{
            marginVertical: 20,
            marginRight: 25,
            marginLeft: 25,
          }}
          inputContainerStyle={{backgroundColor: colors.whiteColor}}
          tintColor={color}
        />
        <OutlinedTextField
          label={getLocalizedText('enterdetails')}
          autoCorrect={false}
          spellCheck={false}
          keyboardType="default"
          value={details}
          onChangeText={detailsChangedHandler}
          color={color}
          inputContainerStyle={{backgroundColor: colors.whiteColor}}
          containerStyle={{marginRight: 25, marginLeft: 25}}
          tintColor={color}
        />
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.datePickerBox}
            onPress={() => {
              setShow(true);
            }}>
            <Icon name="calendar" size={30} color={color} />
            <Text style={styles.datePickerText}>
              {moment(date).format('LL')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...styles.datePickerBox,
              flex: 0.3,
              alignItems: 'center',
            }}
            onPress={() => showImagePicker()}>
            <Icon name="camera" size={30} color={color} />
            {uploadUri ? (
              <Image
                source={{uri: uploadUri}}
                style={{width: 40, height: 40, borderRadius: 20}}
              />
            ) : (
              <Text style={styles.datePickerText}>
                {getLocalizedText('addbill')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {show && (
          <DateTimePicker
            value={date}
            maximumDate={new Date()}
            mode={'date'}
            is24Hour={true}
            display="default"
            onChange={onChange}
          />
        )}
        <View style={styles.bottom}>
          <AppButton
            style={{...styles.button, backgroundColor: color}}
            title={getLocalizedText('save')}
            onPress={() => submitHandler()}
          />
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  bottom: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    margin: 5,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 25,
    marginTop: 10,
  },
  datePickerBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.grey,
    borderWidth: 0.5,
    padding: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    height: 50,
    flex: 0.4,
    alignItems: 'center',
    backgroundColor: 'white',
  },

  datePickerText: {
    fontSize: 14,
    borderWidth: 0,
    color: '#000',
  },
});

CreditDebitScreen.navigationOptions = ({navigation}) => {
  return {
    title: navigation.getParam('data').title,
    headerStyle: {
      backgroundColor: colors.whiteColor,
    },
    headerTintColor: navigation.getParam('data').color,
    headerTitleStyle: {
      color: navigation.getParam('data').color,
    },
  };
};

export default CreditDebitScreen;

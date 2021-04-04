import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import colors from '../constants/colors';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import 'moment/locale/gu';
import {getLocalizedText} from '../localization/config';

moment.locale('gu');

const EntryDetailsScreen = props => {
  const khatabook = props.navigation.getParam('khatabook');
  const customer = props.navigation.getParam('customer');
  const items = props.navigation.getParam('items');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(items.imagePath ? items.imagePath : '');

  const editHandler = () => {
    if (items.isGave) {
      props.navigation.navigate('CreditDebitScreen', {
        data: {
          title: `${customer}`,
          color: colors.red,
          profile: customer,
          customerId: items.id,
          khatabookname: khatabook,
          items: items,
          edit: true,
        },
      });
    } else {
      props.navigation.navigate('CreditDebitScreen', {
        data: {
          title: `${customer}`,
          color: colors.green,
          profile: customer,
          customerId: items.id,
          khatabookname: khatabook,
          items: items,
          edit: true,
        },
      });
    }
  };

  const currentTotalGaveAndGot = () => {
    return database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`customers/${khatabook}/${customer}`)
      .once('value')
      .then(res => {
        let totalGave = res.child('totalGave').val();
        let totalGot = res.child('totalGot').val();

        if (items.isGave && items.amount) {
          totalGave =
            totalGave > 0
              ? totalGave + Number(items.amount)
              : totalGot - Number(items.amount) < 0
              ? Number(items.amount) - totalGot
              : 0;
          totalGot =
            totalGot - Number(items.amount) > 0
              ? totalGot - Number(items.amount)
              : 0;
        } else if (items.isGot && items.amount) {
          totalGot =
            totalGot > 0
              ? totalGot + Number(items.amount)
              : totalGave - Number(items.amount) < 0
              ? Number(items.amount) - totalGave
              : 0;
          totalGave =
            totalGave - Number(items.amount) > 0
              ? totalGave - Number(items.amount)
              : 0;
        }
        return {
          totalGave: totalGave,
          totalGot: totalGot,
        };
      });
  };

  const updateTotalGaveAndGot = async () => {
    const updatedTotal = await currentTotalGaveAndGot();
    database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`customers/${khatabook}/${customer}`)
      .update({
        totalGave: updatedTotal.totalGave,
        totalGot: updatedTotal.totalGot,
      });
  };

  const dataAfterDelete = () => {
    return database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`customers/${khatabook}/${customer}/entries`)
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
          return data;
        }
      });
  };

  const updatedData = async () => {
    const newData = await dataAfterDelete();

    if (newData) {
      database()
        .ref()
        .child(auth().currentUser.uid.toString())
        .child(`customers/${khatabook}/${customer}/entries`)
        .set(newData)
        .then(() => {
          setIsLoading(false);
          setError(null);
          props.navigation.goBack();
        })
        .catch(error => {
          setError(error);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setError(null);
      props.navigation.goBack();
    }
  };

  const deleteEntryHandler = () => {
    Alert.alert('Are You Sure ?', `${getLocalizedText('deleteEntry')}`, [
      {text: getLocalizedText('no')},
      {
        text: getLocalizedText('yes'),
        onPress: () => {
          setError(null);
          setIsLoading(true);
          database()
            .ref()
            .child(auth().currentUser.uid.toString())
            .child(`customers/${khatabook}/${customer}/entries/${items.id}`)
            .remove();
          updateTotalGaveAndGot();
          updatedData();
        },
      },
    ]);
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

  if (isLoading) {
    return (
      <ActivityIndicator
        size="large"
        color={colors.headerColor}
        style={{alignItems: 'center', justifyContent: 'center', flex: 1}}
      />
    );
  }
  return (
    <View style={styles.screen}>
      <View style={styles.reportRootContainer}>
        <View style={styles.reportContainer}>
          <View style={styles.listItemContainer}>
            <View style={{flexDirection: 'row'}}>
              <View style={styles.conOne}>
                <Text style={styles.txtOne}>
                  {customer.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.conTwo}>
                <Text style={styles.txtTwo}>{customer}</Text>
                <Text style={styles.txtThree}>
                  {moment(items.date).format('L')}
                </Text>
              </View>
            </View>
            <View style={styles.conThree}>
              <Text
                style={{
                  alignSelf: 'flex-end',
                  color: items.isGave ? colors.red : colors.green,
                }}>
                ₹{items.amount}
              </Text>
              <Text style={styles.txtThree}>
                {items.isGave
                  ? `${getLocalizedText('gave')}`
                  : `${getLocalizedText('got')}`}
              </Text>
            </View>
          </View>

          {items.details && (
            <>
              <View style={styles.horizontal} />
              <View style={{padding: 10}}>
                <Text style={{fontFamily: 'OpenSans-Bold', color: colors.grey}}>
                  {getLocalizedText('Details')}
                </Text>
                <Text
                  style={{
                    fontFamily: 'OpenSans-Regular',
                    fontSize: 12,
                    marginTop: 5,
                  }}>
                  {items.details}
                </Text>
              </View>
            </>
          )}

          {items.imagePath && (
            <>
              <View style={styles.horizontal} />
              <TouchableOpacity
                style={{padding: 10}}
                onPress={() => {
                  props.navigation.navigate('ImagePreviewScreen', {
                    imagePath: items.imagePath,
                  });
                }}>
                <Text style={{fontFamily: 'OpenSans-Bold', color: colors.grey}}>
                  {getLocalizedText('photoattac')}
                </Text>

                <Image
                  source={{uri: image}}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    marginVertical: 5,
                  }}
                  onError={e => {
                    setImage(
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRBTEghTW2XOwmp-PbaaC76eKvC7jH61oZfDQ&usqp=CAU',
                    );
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </>
          )}
          <View style={styles.horizontal} />
          <View
            style={{
              padding: 12,
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                fontFamily: 'OpenSans-Regular',
                fontSize: 14,
                alignItems: 'center',
              }}>
              {getLocalizedText('currbal')}
            </Text>
            <Text style={{color: colors.green, fontFamily: 'OpenSans-Regular'}}>
              ₹ {items.gave > 0 ? items.gave : items.got}
            </Text>
          </View>
          <View style={styles.horizontal} />
          <TouchableOpacity
            style={{
              padding: 15,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
            onPress={() => editHandler()}>
            <Icon name="edit" color={colors.headerColor} size={24} />
            <Text
              style={{
                color: colors.headerColor,
                fontFamily: 'OpenSans-Bold',
                marginLeft: 8,
              }}>
              {getLocalizedText('editentry')}
            </Text>
          </TouchableOpacity>
          <View style={styles.horizontal} />
          <TouchableOpacity
            style={{
              padding: 15,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
            onPress={() => deleteEntryHandler()}>
            <Icon name="delete" color={colors.red} size={24} />
            <Text
              style={{
                color: colors.red,
                fontFamily: 'OpenSans-Bold',
                marginLeft: 8,
              }}>
              {getLocalizedText('deleteentry')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  reportRootContainer: {
    backgroundColor: colors.headerColor,
  },
  reportContainer: {
    backgroundColor: colors.whiteColor,
    borderRadius: 10,
    width: '90%',
    marginHorizontal: 20,
    marginVertical: 15,
    flexDirection: 'column',
  },
  horizontal: {
    width: '100%',
    height: 1.2,
    backgroundColor: '#EFF0F2',
  },
  listItemContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 10,
  },
  conOne: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.headerColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conTwo: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: 10,
  },
  conThree: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginRight: 6,
  },
  txtOne: {
    fontSize: 20,
    color: colors.whiteColor,
    fontFamily: 'OpenSans-Bold',
  },
  txtTwo: {
    fontSize: 20,
    fontFamily: 'OpenSans-Regular',
  },
  txtThree: {
    color: colors.grey,
    fontSize: 12,
    fontFamily: 'OpenSans-Regular',
    marginTop: 6,
  },
});
EntryDetailsScreen.navigationOptions = ({navigation}) => {
  return {
    title: 'Entry Details',
  };
};

export default EntryDetailsScreen;

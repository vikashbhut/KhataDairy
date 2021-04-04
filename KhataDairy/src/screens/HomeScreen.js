import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  View,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/AntDesign';
import {removeKhataBook, fetchKhataBook} from '../store/actions/khatabook';
import colors from '../constants/colors';
import AppButton from '../components/AppButton';
import {useIsMountedRef} from '../utils/utils';
import KhataBook from '../models/KhataBook';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {getLocalizedText} from '../localization/config';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import HeaderButton from '../components/HeaderButton';

const Items = ({itemData, removeHandler, navigation}) => {
  const {id, name} = itemData;

  return (
    <TouchableOpacity
      style={styles.items}
      activeOpacity={0.6}
      onPress={() => navigation.navigate('KhataBook', {title: name})}>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.iconContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text style={{...styles.text, fontFamily: 'OpenSans-Regular'}}>
          {name}
        </Text>
      </View>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('AddKhataBook', {
              edit: name,
              title: 'Edit Khatabookname',
            });
          }}>
          <Icon name="edit" size={23} style={{marginRight: 30}} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(`Are You Sure?`, `${getLocalizedText('deletekhata')}`, [
              {text: `${getLocalizedText('no')}`},
              {
                text: `${getLocalizedText('yes')}`,
                onPress: removeHandler.bind(this, id, name),
              },
            ])
          }>
          <Icon name="delete" size={23} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = props => {
  const khatabook = useSelector(state => state.khatabook);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMountedRef = useIsMountedRef();

  useEffect(() => {
    const fetchData = () => {
      let loadedKhataBooks = [];
      setIsLoading(true);
      setError(null);
      database()
        .ref()
        .child(auth().currentUser.uid.toString())
        .child('khatabooks')
        .once('value', snapshot => {
          const resData = snapshot.toJSON();
          for (let key in resData) {
            loadedKhataBooks.push(
              new KhataBook(resData[key].id, resData[key].name),
            );
          }
        })
        .then(() => {
          if (isMountedRef.current) {
            dispatch(fetchKhataBook(loadedKhataBooks));
            setIsLoading(false);
          }
        })
        .catch(err => {
          if (isMountedRef.current) {
            setError(err.message);
            setIsLoading(false);
          }
        });
    };
    fetchData();
    const willFocuSubscription = props.navigation.addListener(
      'willFocus',
      fetchData,
    );
    return () => {
      willFocuSubscription.remove();
    };
  }, []);

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

  const removeHandler = (id, name) => {
    setIsLoading(true);
    setError(null);
    database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`khatabooks/${name}`)
      .remove()
      .then(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
          dispatch(removeKhataBook(id));
        }
      })
      .catch(err => {
        if (isMountedRef.current) {
          setError(err.message);
          setIsLoading(false);
        }
      });
    database()
      .ref()
      .child(auth().currentUser.uid.toString())
      .child(`customers/${name}`)
      .remove()
      .catch(err => {
        if (isMountedRef.current) {
          setError(err.message);
        }
      });
  };

  return (
    <View style={styles.screen}>
      {khatabook.khatabooks.length > 0 ? (
        isLoading ? (
          <ActivityIndicator
            size="large"
            style={styles.textContainer}
            color={colors.headerColor}
          />
        ) : (
          <FlatList
            data={khatabook.khatabooks}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            renderItem={itemData => (
              <Items
                itemData={itemData.item}
                dispatch={dispatch}
                navigation={props.navigation}
                removeHandler={removeHandler}
              />
            )}
          />
        )
      ) : isLoading ? (
        <ActivityIndicator
          size="large"
          style={styles.textContainer}
          color={colors.headerColor}
        />
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{getLocalizedText('addkhatabook')}</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <AppButton
          title={getLocalizedText('addkhatabook')}
          onPress={() => props.navigation.navigate('AddKhataBook')}
        />
      </View>
    </View>
  );
};

HomeScreen.navigationOptions = ({navigate}) => {
  return {
    title: 'KhataBooks',
  };
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    width: 150,
    height: 60,
  },
  screen: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  text: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
  },
  items: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.6,
    borderBottomColor: colors.grey,
  },
  iconContainer: {
    width: 30,
    height: 30,
    marginRight: 6,
  },
  list: {
    width: '100%',
    height: '70%',
    padding: 10,
  },
  buttonContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
});

HomeScreen.navigationOptions = ({navigation}) => {
  return {
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="logout"
          iconName="log-out"
          onPress={() =>
            auth()
              .signOut()
              .then(() => navigation.navigate('Splash'))
          }
        />
      </HeaderButtons>
    ),
  };
};
export default HomeScreen;

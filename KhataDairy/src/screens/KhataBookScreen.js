import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ToastAndroid,
  ActivityIndicator,
  TouchableOpacity,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import AppButton from '../components/AppButton';
import {useDispatch, useSelector} from 'react-redux';
import {fetchCustomers} from '../store/actions/khatabook';
import colors from '../constants/colors';
import {useCountUp} from 'react-countup';
import SearchComponent from '../components/SearchComponent';
import Customer from '../models/Customer';
import moment from 'moment';
import 'moment/locale/gu';
import {useIsMountedRef} from '../utils/utils';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {getLocalizedText} from '../localization/config';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import IconDate from 'react-native-vector-icons/EvilIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

moment.locale('gu');

const Items = ({item, navigation}) => {
  const {name, date, id, totalGave, totalGot} = item;
  return (
    <TouchableOpacity
      style={styles.listItemContainer}
      onPress={() =>
        navigation.navigate('CustomerScreen', {
          title: name,
          khatabook: navigation.getParam('title'),
          customerId: id,
          item: item,
        })
      }>
      <View style={{flexDirection: 'row'}}>
        <View style={styles.conOne}>
          <Text style={styles.txtOne}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.conTwo}>
          <Text style={styles.txtTwo}>{name}</Text>
          <Text style={styles.txtThree}>
            {moment(new Date(date)).fromNow()}
          </Text>
        </View>
      </View>
      <View style={styles.conThree}>
        <Text style={{alignSelf: 'flex-end'}}>
          {totalGot > 0 ? `₹${totalGot}` : `₹${totalGave}`}
        </Text>
        <Text style={{color: colors.grey}}>
          {totalGot > 0
            ? `${getLocalizedText('willget')}`
            : `${getLocalizedText('willpay')}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
const ReportContainer = props => {
  const {countUp} = useCountUp({
    end: Number(props.rupee),
    start: 0,
    delay: 0,
    duration: 5,
  });

  return (
    <View style={styles.textContainer}>
      <Text style={{...styles.text, color: props.color}}>
        {'₹'}
        {countUp}
      </Text>
      <Text style={styles.grey}>{props.title}</Text>
    </View>
  );
};

const HeaderComponent = props => {
  return (
    <>
      <View style={styles.reportRootContainer}>
        <View style={styles.reportContainer}>
          <ReportContainer
            color={colors.green}
            rupee={props.totalGave}
            title={getLocalizedText('youwillpay')}
          />
          <ReportContainer
            color={colors.red}
            rupee={props.totalGot}
            title={getLocalizedText('youwillget')}
          />
          <ReportContainer
            color={colors.headerColor}
            rupee={
              props.totalGot > props.totalGave
                ? Number(props.totalGot) - Number(props.totalGave)
                : Number(props.totalGave) - Number(props.totalGot)
            }
            title="કુલ"
          />
        </View>
        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => {
              props.setShow(true);
              props.setDateType('start');
            }}>
            <IconDate name="calendar" size={30} color={colors.headerColor} />
            <Text style={{color: colors.headerColor}}>
              {props.startDate
                ? moment(props.startDate).format('LL')
                : 'પ્રારંભ તારીખ'}
            </Text>
          </TouchableOpacity>
          <View
            style={{
              borderWidth: 0.4,
              borderColor: colors.grey,
              height: '100%',
            }}
          />
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => {
              props.setShow(true);
              props.setDateType('end');
            }}>
            <IconDate name="calendar" size={30} color={colors.headerColor} />
            <Text style={{color: colors.headerColor}}>
              {props.endDate
                ? moment(props.endDate).format('LL')
                : 'અંતિમ તારીખ'}
            </Text>
          </TouchableOpacity>
          {props.show && props.dateType === 'start' && (
            <DateTimePicker
              value={props.startDate || new Date()}
              maximumDate={props.endDate ?? new Date()}
              mode={'date'}
              is24Hour={true}
              display="default"
              onChange={props.onChange}
            />
          )}
          {props.show && props.dateType === 'end' && (
            <DateTimePicker
              value={props.endDate || new Date()}
              maximumDate={new Date()}
              mode={'date'}
              is24Hour={true}
              display="default"
              {...props.startDate && {minimumDate: props.startDate}}
              onChange={props.onEndChange}
            />
          )}
        </View>
      </View>

      <SearchComponent
        touched={props.touched}
        SearchFilterFunction={props.SearchFilterFunction}
        setTouched={props.setTouched}
        search={props.search}
        numberOfCustomer={props.numberOfCustomer}
        onPdfPress={props.onPdfPress}
      />
    </>
  );
};

const FlatListItemSeparator = () => {
  return <View style={styles.itemSeprator} />;
};
const KhataBookScreen = props => {
  const [filterdData, setFilteredData] = useState();
  const [search, setSearch] = useState();
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const khatabook = useSelector(state => state.khatabook);
  const customers = useSelector(state => state.khatabook.customers);
  const isMountedRef = useIsMountedRef();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [show, setShow] = useState(false);
  const [dateType, setDateType] = useState('');

  const dispatch = useDispatch();

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDateType('');
    setStartDate(currentDate);
  };

  const onEndChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDateType('');
    setEndDate(currentDate);
  };

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('willFocus', () => {
      setStartDate('');
      setEndDate();
      setDateType();
    });
    return () => {
      unsubscribe;
    };
  }, []);

  const filterArray = data => {
    if (startDate && endDate) {
      return (
        moment(data.date).isSameOrAfter(startDate, 'day') &&
        moment(data.date).isSameOrBefore(endDate, 'day')
      );
    } else if (startDate) {
      return moment(data.date).isSameOrAfter(startDate, 'day');
    } else if (endDate) {
      return moment(data.date).isSameOrBefore(endDate, 'day');
    }

    return true;
  };

  const createPDF = async () => {
    let options = {
      //Content to print
      html: customers
        .filter(customer => customer['entries'])
        .map(customer => {
          return Object.values(customer.entries).filter(filterArray).length > 0
            ? ` <table style="width: 100%;">
      <caption style="font-style: italic;font-size:30px">
            ${customer.name}
      </caption>
      <tr>
          <td style="text-align: center;width:100%">
              ગ્રાહક વ્યવહાર ઇતિહાસ${
                customer['entries']
                  ? '(' +
                    moment(
                      startDate
                        ? startDate
                        : Object.values(customer.entries)[
                            Object.values(customer.entries).length - 1
                          ].date,
                    ).format('DD/MM/YYYY') +
                    '-' +
                    moment(
                      endDate
                        ? endDate
                        : Object.values(customer.entries)[0].date,
                    ).format('DD/MM/YYYY') +
                    ')'
                  : ''
              }
          </td>
      </tr> 
      <tr>
        ${
          customer['entries'] &&
          Object.values(customer.entries).filter(filterArray).length > 0
            ? `
        <table   style="font-family: Arial, Helvetica, sans-serif;border-collapse: collapse;width: 100%;border: 1px solid black;">
                <tr>
                  <th style="border: 1px solid black;">S.No</th>
                  <th style="border: 1px solid black;">તારીખ</th>
                  <th style="border: 1px solid black;">વિગત</th>
                  <th style="border: 1px solid black;">તમને મળયા(+)</th>
                  <th style="border: 1px solid black;">તમે આપ્યા(-)</th>
                  <th style="border: 1px solid black;">કુલ(લેવાના/ચુકવશો)</th>
                </tr>
                ${Object.values(customer.entries)
                  .filter(filterArray)
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  .map((entry, index) => {
                    return `
                        <tr>
                          <td style="border: 1px solid black;text-align: center">${index +
                            1}</td>
                           <td style="border: 1px solid black;text-align: center">${moment(
                             entry.date,
                           ).format('DD/MM/YYYY')}</td>
                           <td style="border: 1px solid black;text-align:left">${
                             entry['details'] ? entry['details'] : ''
                           }</td>
                            <td style="border: 1px solid black;text-align:right;color: green;"> ${
                              entry.isGot ? entry.amount : ''
                            }</td>
                            <td style="border: 1px solid black;text-align:right; color: red;">  ${
                              entry.isGave ? entry.amount : ''
                            } </td>
                            <td style="border: 1px solid black;text-align:right"> ${
                              entry.gave > 0
                                ? entry.gave + ` ચુકવશો`
                                : entry.got + ` લેવાના`
                            }</td>
                        </tr>
                    
                    `;
                  })
                  .join('')}
              <tr>
                  <td style="border: 1px solid black;text-align: center"></td>
                  <td style="border: 1px solid black;text-align: center"></td>
                  <td style="border: 1px solid black;text-align: center">Total</td>
                  <td style="border: 1px solid black;text-align:right;color:green"> ${Object.values(
                    customer.entries,
                  )
                    .map(value => {
                      if (value.isGot) {
                        return Number(value.amount);
                      }
                      return 0;
                    })
                    .reduce((acc, curr) => acc + curr)}</td>
                  <td style="border: 1px solid black;text-align:right;color:red">
                     ${Object.values(customer.entries)
                       .map(value => {
                         if (value.isGave) {
                           return Number(value.amount);
                         }
                         return 0;
                       })
                       .reduce((acc, curr) => acc + curr)}
                  </td>
                  <td style="border: 1px solid black;text-align:right">
                        ${
                          customer.totalGot > 0
                            ? customer.totalGot + `  લેવાના`
                            : customer.totalGave + ` ચુકવશો`
                        }
                  </td>
              </tr>
                
          </table>
           `
            : ''
        }
      </tr>
    
  </table>`
            : '';
        })
        .join('<br/><br/><br/>'),
      //File Name

      fileName: 'khataDairy-mini-statement' + new Date().getTime(),
      //File directory

      directory: 'khataDairypdf',
    };
    let file = await RNHTMLtoPDF.convert(options);
    const android = RNFetchBlob.android;
    android.actionViewIntent(file.filePath, 'application/pdf');
  };

  const onPdfCreate = () => {
    async function requestExternalWritePermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'KhataDairy App needs External Storage Write Permission',
            message:
              'KhataDairy App needs access to Storage data in your SD Card ',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          //If WRITE_EXTERNAL_STORAGE Permission is granted
          //changing the state to show Create PDF option
          createPDF();
        } else {
          alert('WRITE_EXTERNAL_STORAGE permission denied');
        }
      } catch (err) {
        alert('Write permission err', err);
      }
    }
    //Calling the External Write permission function
    if (Platform.OS === 'android') {
      requestExternalWritePermission();
    } else {
      createPDF();
    }
  };

  useEffect(() => {
    const fetchData = () => {
      let loadedCustomers = [];
      setIsLoading(true);
      setError(null);
      database()
        .ref()
        .child(auth().currentUser.uid.toString())
        .child(`customers/${props.navigation.getParam('title')}`)
        .once('value', snapshot => {
          let resData = snapshot.toJSON();
          for (let key in resData) {
            loadedCustomers.push(
              new Customer(
                resData[key].id,
                resData[key].name,
                resData[key].entries,
                resData[key].totalGave,
                resData[key].totalGot,
                resData[key].date,
              ),
            );
          }
        })
        .then(() => {
          if (isMountedRef.current) {
            loadedCustomers.sort((a, b) => b.date - a.date);
            dispatch(fetchCustomers(loadedCustomers));
            setFilteredData(loadedCustomers);
            setIsLoading(false);
          }
        })
        .catch(err => {
          if (isMountedRef.current) {
            setIsLoading(false);
            setError(err.message);
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

  const SearchFilterFunction = text => {
    const newData = khatabook.customers.filter(function(item) {
      const itemData = item.name.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    setFilteredData(newData);
    setSearch(text);
  };
  return (
    <View style={styles.screen}>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.headerColor}
          style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}
        />
      ) : filterdData && filterdData.length > 0 ? (
        <FlatList
          data={filterdData}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{backgroundColor: colors.whiteColor}}
          ListHeaderComponent={
            <HeaderComponent
              touched={touched}
              SearchFilterFunction={SearchFilterFunction}
              setTouched={setTouched}
              search={search}
              totalGot={khatabook.totalGot}
              totalGave={khatabook.totalGave}
              numberOfCustomer={filterdData.length}
              onPdfPress={onPdfCreate}
              onChange={onChange}
              onEndChange={onEndChange}
              setShow={setShow}
              setDateType={setDateType}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              dateType={dateType}
              startDate={startDate}
              endDate={endDate}
              show={show}
            />
          }
          ListFooterComponent={<View style={styles.footerComponent} />}
          ItemSeparatorComponent={FlatListItemSeparator}
          renderItem={({item}) => (
            <Items item={item} navigation={props.navigation} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{getLocalizedText('Addnewcustomer')}</Text>
        </View>
      )}

      <View style={styles.iconContainer}>
        <AppButton
          title={<Icon name="adduser" size={35} color={colors.whiteColor} />}
          onPress={() =>
            props.navigation.navigate('AddNewCustomer', {
              khatabookname: props.navigation.getParam('title'),
            })
          }
        />
      </View>
    </View>
  );
};

KhataBookScreen.navigationOptions = ({navigation}) => {
  return {
    title: navigation.getParam('title'),
  };
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.whiteColor,
  },
  iconContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    margin: 30,
  },
  reportRootContainer: {
    backgroundColor: colors.headerColor,
  },
  reportContainer: {
    backgroundColor: colors.whiteColor,
    borderRadius: 10,
    height: 80,
    width: '90%',
    marginHorizontal: 20,
    marginVertical: 15,
    flexDirection: 'row',
  },
  headerStyle: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: colors.black,
    borderBottomWidth: 0.4,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
  },
  itemSeprator: {
    height: 1,
    width: '100%',
    backgroundColor: '#EFF0F2',
  },
  listItemContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 15,
  },
  footerComponent: {
    flex: 1,
    padding: 50,
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
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateContainer: {
    backgroundColor: colors.whiteColor,
    borderRadius: 10,
    height: 50,
    width: '90%',
    marginHorizontal: 20,
    marginVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
export default KhataBookScreen;

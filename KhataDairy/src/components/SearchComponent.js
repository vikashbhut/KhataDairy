import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import colors from '../constants/colors';
import {Input} from 'react-native-elements';
import Icon from 'react-native-vector-icons/AntDesign';
import IconCross from 'react-native-vector-icons/Entypo';
import {getLocalizedText} from '../localization/config';

const SearchComponent = props => {
  return (
    <>
      {props.touched ? (
        <View style={styles.inputContainer}>
          <Input
            placeholder="Search name"
            onChangeText={text => props.SearchFilterFunction(text)}
            value={props.search}
            rightIcon={
              <IconCross
                name="cross"
                color={colors.headerColor}
                size={25}
                onPress={() => {
                  props.setTouched(prevState => !prevState);
                  props.SearchFilterFunction('');
                }}
              />
            }
            inputContainerStyle={{borderBottomWidth: 0}}
            autoFocus={true}
            autoCorrect={false}
          />
        </View>
      ) : (
        <View style={styles.searchContainer}>
          <TouchableWithoutFeedback
            onPress={() => props.setTouched(prevState => !prevState)}>
            <View style={styles.iconSearchContaier}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity>
                  <Icon
                    name="search1"
                    size={25}
                    color={colors.headerColor}
                    onPress={() => props.setTouched(prevState => !prevState)}
                  />
                </TouchableOpacity>
                <Text style={{color: colors.grey, marginLeft: 8, fontSize: 16}}>
                  {props.numberOfCustomer} {getLocalizedText('cust')}
                </Text>
              </View>
              <TouchableOpacity activeOpacity={0.6}>
                <Icon
                  name="pdffile1"
                  size={25}
                  color={colors.headerColor}
                  onPress={() => props.onPdfPress()}
                />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    backgroundColor: colors.whiteColor,
    height: 50,
    borderBottomWidth: 1.5,
    borderBottomColor: '#EFF0F2',
    padding: 10,
  },
  iconSearchContaier: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputContainer: {
    backgroundColor: colors.whiteColor,
    width: '100%',
    height: 50,
    borderBottomColor: '#EFF0F2',
    borderBottomWidth: 1.5,
  },
});
export default SearchComponent;

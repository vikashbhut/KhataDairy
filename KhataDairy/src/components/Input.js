import React, {useReducer, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {OutlinedTextField} from 'react-native-material-textfield';
import Colors from '../constants/colors';

const INPUT_CHANGE = 'INPUT_CHANGE';
const INPUT_BLUR = 'INPUT_BLUR';
const inputReducer = (state, action) => {
  switch (action.type) {
    case INPUT_CHANGE:
      return {
        ...state,
        value: action.value,
        isValid: action.isValid,
      };
    case INPUT_BLUR:
      return {
        ...state,
        touched: true,
      };

    default:
      return state;
  }
};
const Input = props => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: props.initialValue ? props.initialValue : '',
    isValid: props.initialValid,
    touched: false,
  });

  const {onInputChange, id} = props;
  useEffect(() => {
    if (inputState.touched) {
      onInputChange(id, inputState.value, inputState.isValid);
    }
  }, [inputState, onInputChange]);
  const lostFocusHandler = () => {
    dispatch({type: INPUT_BLUR});
  };
  const textChangeHandler = text => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid = true;
    if (props.required && text.trim().length === 0) {
      isValid = false;
    }
    if (props.email && !emailRegex.test(text.toLowerCase())) {
      isValid = false;
    }
    if (props.min != null && +text < props.min) {
      isValid = false;
    }
    if (props.max != null && +text > props.max) {
      isValid = false;
    }
    if (props.minLength != null && text.length < props.minLength) {
      isValid = false;
    }
    dispatch({type: INPUT_CHANGE, value: text, isValid: isValid});
  };
  return (
    <View style={styles.formControl}>
      <OutlinedTextField
        label={props.label}
        autoCorrect={false}
        spellCheck={false}
        value={inputState.value}
        onChangeText={textChangeHandler}
        onBlur={lostFocusHandler}
        tintColor={Colors.headerColor}
        error={!inputState.isValid ? props.errorText : ''}
        {...props}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  formControl: {
    width: '100%',
    marginVertical: 7,
  },
});
export default Input;

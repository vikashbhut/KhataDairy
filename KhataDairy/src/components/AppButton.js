import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Colors from '../constants/colors'


const AppButton = ({ onPress, title, disabled ,style }) => (
    <TouchableOpacity onPress={onPress} style={{...styles.appButtonContainer, opacity : disabled ? 0.6 : 1,...style}} activeOpacity={0.6} disabled={disabled}>
        <Text style={styles.appButtonText}>{title}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    appButtonContainer: {
        elevation: 8,
        backgroundColor: Colors.headerColor,
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 12
    },
    appButtonText: {
        fontSize: 18,
        color: "#fff",
        alignSelf: "center",
        textTransform: "uppercase"
    },
});

export default AppButton;
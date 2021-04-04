import {HeaderButton} from "react-navigation-header-buttons";
import Icon from 'react-native-vector-icons/Entypo';
import React from 'react';

const CustomHeaderButton=props=>{
    return <HeaderButton {...props} IconComponent={Icon} iconSize={23} color={'white'}/>
}

export default CustomHeaderButton;
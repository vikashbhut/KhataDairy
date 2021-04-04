import React, {useState} from 'react';
import {View, Image} from 'react-native';

const ImagePreviewScreen = props => {
  const [image, setImage] = useState(props.navigation.getParam('imagePath'));

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Image
        source={{uri: image}}
        style={{width: '100%', height: '100%'}}
        onError={e => {
          setImage(
            'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRBTEghTW2XOwmp-PbaaC76eKvC7jH61oZfDQ&usqp=CAU',
          );
        }}
      />
    </View>
  );
};

ImagePreviewScreen.navigationOptions = ({navigation}) => {
  return {
    title: 'Image',
  };
};

export default ImagePreviewScreen;

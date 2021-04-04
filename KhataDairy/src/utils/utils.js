import { Dimensions, PixelRatio } from 'react-native';
import {useEffect,useRef} from 'react';

export function useIsMountedRef(){
    const isMountedRef = useRef(null);
    useEffect(() => {
      isMountedRef.current = true;
      return () => isMountedRef.current = false;
    });
    return isMountedRef;
  }
export const widthPercentageToDP = widthPercent => {
    const screenWidth = Dimensions.get('window').width;
    const elemWidth = parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel(screenWidth * elemWidth / 100);
};
export const heightPercentageToDP = heightPercent => {
    const screenHeight = Dimensions.get('window').height;
    const elemHeight = parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel(screenHeight * elemHeight / 100);
};
import React, { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const NetworkContext = React.createContext({ isConnected: true });

export const NetworkProvider = props => {

  const [isConnected, setIsConnected] = useState(true);

  const handleConnectivityChange = state => {
    setIsConnected(state.isConnected);
  }
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    return () => {
      unsubscribe();
    }
  }, [])
  return (
    <NetworkContext.Provider value={isConnected}>
      {props.children}
    </NetworkContext.Provider>
  );
}
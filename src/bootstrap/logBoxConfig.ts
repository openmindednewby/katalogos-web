import { LogBox } from 'react-native';

if (typeof __DEV__ !== 'undefined' && !__DEV__) 
  LogBox.ignoreAllLogs(true);


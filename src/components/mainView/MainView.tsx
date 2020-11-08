import React from 'react';
import { StyleSheet, View } from 'react-native';

import TabView from '../tabView/TabView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function MainView(): JSX.Element {
  return (
    <View style={styles.container}>
      <TabView />
    </View>
  );
}

export default MainView;

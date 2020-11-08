import React from 'react';
import { StyleSheet, Text, ScrollView, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  viewContainer: {
    marginVertical: 65,
    marginHorizontal: 30,
  },
});

function Settings(): JSX.Element {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.viewContainer}>
        <Text style={{ fontSize: 20 }}>Settings</Text>
      </View>
    </ScrollView>
  );
}

export default Settings;

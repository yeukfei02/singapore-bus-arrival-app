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

function BusArrivalDetails(): JSX.Element {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.viewContainer}>
        <Text style={{ fontSize: 20 }}>BusArrivalDetails</Text>

        <View style={{ marginVertical: 20 }}></View>
      </View>
    </ScrollView>
  );
}

export default BusArrivalDetails;

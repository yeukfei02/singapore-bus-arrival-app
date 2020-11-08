import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity, Linking } from 'react-native';
import { Card, List } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import moment from 'moment';

import { gql, useLazyQuery } from '@apollo/client';

import { getAsyncStorageData } from '../../common/common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  viewContainer: {
    marginVertical: 65,
    marginHorizontal: 30,
  },
  noDataContainer: {
    backgroundColor: 'gainsboro',
    padding: 20,
    borderRadius: 5,
  },
  loadingContainer: {
    backgroundColor: 'moccasin',
    padding: 20,
    borderRadius: 5,
  },
  errorContainer: {
    backgroundColor: 'tomato',
    padding: 20,
    borderRadius: 5,
  },
  busArrivalResultContainer: {
    backgroundColor: 'gainsboro',
    padding: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
});

const GET_BUS_ARRIVAL = gql`
  query busArrival($busStopCode: String!) {
    busArrival(busStopCode: $busStopCode) {
      busStopCode
      services {
        busNumber
        operator
        nextBus {
          estimatedArrival
          latitude
          longitude
          load
          feature
          type
        }
      }
    }
  }
`;

function BusArrivalDetails(props: any): JSX.Element {
  const route = useRoute();

  const [theme, setTheme] = useState('light');

  const [responseData, setResponseData] = useState<any>(null);

  const [getBusArrival, { loading, error, data }] = useLazyQuery(GET_BUS_ARRIVAL);

  console.log('loading = ', loading);
  console.log('error = ', error);
  console.log('data = ', data);

  useEffect(() => {
    getThemeData();
    props.navigation.addListener('focus', () => {
      getThemeData();
    });
  }, []);

  useEffect(() => {
    if (route.params) {
      const busStopCode = (route.params as any).busStopCode;
      getBusArrival({
        variables: { busStopCode: busStopCode },
      });
    }
  }, [route.params]);

  useEffect(() => {
    if (data) {
      setResponseData(data);
    }
  }, [data]);

  const getThemeData = async () => {
    const theme = await getAsyncStorageData('@theme');
    if (theme) {
      setTheme(theme);
    }
  };

  const handleBackButtonClick = () => {
    props.navigation.goBack();
  };

  const renderBusArrivalResultDiv = () => {
    let busArrivalResultDiv = (
      <View style={styles.noDataContainer}>
        <Text>There is no data</Text>
      </View>
    );

    if (loading) {
      busArrivalResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (error) {
        busArrivalResultDiv = (
          <View style={styles.errorContainer}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (responseData && responseData.busArrival.services) {
          busArrivalResultDiv = responseData.busArrival.services.map((item: any, i: number) => {
            const nextBusList = item.nextBus;
            const nextBusListResultDiv = nextBusList.map((item: any, i: number) => {
              let timeDiff = moment(item.estimatedArrival).diff(moment(), 'minutes');
              if (isNaN(timeDiff)) {
                timeDiff = 0;
              }

              return (
                <Card key={i} style={{ padding: 15, marginVertical: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 10 }}>Next {i + 1} Bus</Text>

                  <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                    <Text style={{ fontSize: 18 }}>Remaining: </Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{timeDiff} minutes</Text>
                  </View>

                  <List.Accordion title="Show more">
                    <Text style={{ marginVertical: 5 }}>{item.load}</Text>
                    <Text style={{ marginVertical: 5 }}>{item.feature}</Text>
                    <Text style={{ marginVertical: 5 }}>{item.type}</Text>

                    <TouchableOpacity onPress={() => handleCheckBusInGoogleMap(item.latitude, item.longitude)}>
                      <Text style={{ color: 'blue', textDecorationLine: 'underline', marginVertical: 5 }}>
                        Check bus in google map
                      </Text>
                    </TouchableOpacity>
                  </List.Accordion>
                </Card>
              );
            });

            return (
              <View key={i} style={styles.busArrivalResultContainer}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.busNumber}</Text>
                <Text style={{ marginVertical: 10 }}>{item.operator}</Text>

                <List.Accordion title="Show details">
                  <View>{nextBusListResultDiv}</View>
                </List.Accordion>
              </View>
            );
          });
        }
      }
    }

    return busArrivalResultDiv;
  };

  const handleCheckBusInGoogleMap = (latitude: number, longitude: number) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme === 'light' ? 'white' : 'black' }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.viewContainer}>
        <TouchableOpacity onPress={() => handleBackButtonClick()}>
          <Ionicons name="md-arrow-round-back" size={24} color={theme === 'light' ? 'black' : 'white'} />
        </TouchableOpacity>

        <View style={{ marginVertical: 15 }}></View>

        <Text style={{ fontSize: 25, fontWeight: 'bold', color: theme === 'light' ? 'black' : 'white' }}>
          Bus Arrival Details
        </Text>

        <View style={{ marginVertical: 10 }}></View>

        {renderBusArrivalResultDiv()}
      </View>
    </ScrollView>
  );
}

export default BusArrivalDetails;

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, View, Image, TouchableOpacity, Linking } from 'react-native';
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
                    <View style={{ marginVertical: 5 }}>{renderLoad(item.load)}</View>
                    <View style={{ marginVertical: 5 }}>{renderFeature(item.feature)}</View>
                    <View style={{ marginVertical: 5 }}>{renderType(item.type)}</View>

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

  const renderLoad = (load: string) => {
    let loadDiv = <Text>{load}</Text>;

    if (load.includes('Seats Available')) {
      loadDiv = (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ borderRadius: 12, backgroundColor: 'green', padding: 12 }}></View>
          <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
            <Text>{load}</Text>
          </View>
        </View>
      );
    } else if (load.includes('Standing Available')) {
      loadDiv = (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ borderRadius: 12, backgroundColor: 'yellow', padding: 12 }}></View>
          <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
            <Text>{load}</Text>
          </View>
        </View>
      );
    } else if (load.includes('Limited Standing')) {
      loadDiv = (
        <View style={{ flexDirection: 'row' }}>
          <View style={{ borderRadius: 12, backgroundColor: 'red', padding: 12 }}></View>
          <View style={{ justifyContent: 'center', marginHorizontal: 10 }}>
            <Text>{load}</Text>
          </View>
        </View>
      );
    }

    return loadDiv;
  };

  const renderFeature = (feature: string) => {
    let featureDiv = <Text>{feature}</Text>;

    if (feature.includes('Wheel-Chair')) {
      featureDiv = (
        <View style={{ flexDirection: 'row' }}>
          <Image source={require('../../images/wheel-chair.png')} style={{ width: 30, height: 30 }} />
          <View style={{ justifyContent: 'center', marginHorizontal: 5 }}>
            <Text>{feature}</Text>
          </View>
        </View>
      );
    }

    return featureDiv;
  };

  const renderType = (type: string) => {
    let typeDiv = <Text>{type}</Text>;

    if (type.includes('Single Deck')) {
      typeDiv = (
        <View style={{ flexDirection: 'row' }}>
          <Image source={require('../../images/bus.png')} style={{ width: 30, height: 30 }} />
          <View style={{ justifyContent: 'center', marginHorizontal: 5 }}>
            <Text>{type}</Text>
          </View>
        </View>
      );
    } else if (type.includes('Double Deck')) {
      typeDiv = (
        <View style={{ flexDirection: 'row' }}>
          <Image source={require('../../images/bus-double-deck.png')} style={{ width: 30, height: 30 }} />
          <View style={{ justifyContent: 'center', marginHorizontal: 5 }}>
            <Text>{type}</Text>
          </View>
        </View>
      );
    }

    return typeDiv;
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

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Image,
  Platform,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Card, List } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import moment from 'moment';

import { gql, useLazyQuery } from '@apollo/client';

import { getAsyncStorageData } from '../../helpers/helpers';

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
  busArrivalResultHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

  const [refreshing, setRefreshing] = useState(false);

  const [getBusArrival, { loading, error, data, client }] = useLazyQuery(GET_BUS_ARRIVAL);

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

  const handleBusNumberClick = (busNumber: string) => {
    if (busNumber) {
      props.navigation.navigate(`BusMapView`, {
        busServiceNo: busNumber,
      });
    }
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

            let firstBusTimeDiffStr = 'Arriving';
            let firstBusTimeDiff = moment(nextBusList[0].estimatedArrival).diff(moment(), 'minutes');
            if (isNaN(firstBusTimeDiff)) {
              firstBusTimeDiff = 0;
            }
            if (firstBusTimeDiff > 0) {
              firstBusTimeDiffStr = `${firstBusTimeDiff.toString()} mins`;
            }

            const nextBusListResultDiv = nextBusList.map((item: any, i: number) => {
              let timeDiff = moment(item.estimatedArrival).diff(moment(), 'minutes');
              if (isNaN(timeDiff)) {
                timeDiff = 0;
              }

              const absTimeDiff = Math.abs(timeDiff);

              return (
                <Card key={i} style={{ padding: 15, marginVertical: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 10 }}>Next {i + 1} Bus</Text>

                  <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                    <Text style={{ fontSize: 18 }}>Remaining: </Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{absTimeDiff} minutes</Text>
                  </View>

                  <List.Accordion title="Show more">
                    <View style={{ marginVertical: 5 }}>{renderLoad(item.load)}</View>
                    <View style={{ marginVertical: 5 }}>{renderFeature(item.feature)}</View>
                    <View style={{ marginVertical: 5 }}>{renderType(item.type)}</View>

                    <TouchableOpacity onPress={() => handleCheckBusInMap(item.latitude, item.longitude)}>
                      <Text style={{ color: 'blue', textDecorationLine: 'underline', marginVertical: 5 }}>
                        Check bus in map
                      </Text>
                    </TouchableOpacity>
                  </List.Accordion>
                </Card>
              );
            });

            return (
              <View key={i} style={styles.busArrivalResultContainer}>
                <View style={styles.busArrivalResultHeaderContainer}>
                  <Text
                    style={{ fontSize: 20, fontWeight: 'bold', textDecorationLine: 'underline' }}
                    onPress={() => handleBusNumberClick(item.busNumber)}
                  >
                    {item.busNumber}
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{firstBusTimeDiffStr}</Text>
                </View>
                <Text style={{ marginVertical: 15 }}>{item.operator}</Text>

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

  const handleCheckBusInMap = (latitude: number, longitude: number) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = 'Bus';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);

    getThemeData();
    client?.clearStore();
    setResponseData(null);
    if (route.params) {
      const busStopCode = (route.params as any).busStopCode;
      getBusArrival({
        variables: { busStopCode: busStopCode },
      });
    }

    if (!loading) {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme === 'light' ? 'white' : 'black' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['tomato', 'tomato', 'black']} />
      }
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.viewContainer}>
        <TouchableOpacity onPress={() => handleBackButtonClick()}>
          <MaterialIcons name="arrow-back" size={24} color={theme === 'light' ? 'black' : 'white'} />
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

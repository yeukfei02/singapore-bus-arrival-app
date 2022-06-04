import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, View, RefreshControl, TouchableOpacity, Platform, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { gql, useLazyQuery } from '@apollo/client';
import { useRoute } from '@react-navigation/native';
import { Switch } from 'react-native-paper';
import * as Location from 'expo-location';
import _ from 'lodash';

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
  busServiceRoutesContainer: {
    backgroundColor: 'gainsboro',
    padding: 16,
    borderRadius: 5,
    marginVertical: 10,
  },
});

const GET_BUS_ROUTE_BY_BUS_SERVICE_NO = gql`
  query busRouteByBusServiceNo($busServiceNo: String!) {
    busRouteByBusServiceNo(busServiceNo: $busServiceNo) {
      serviceNo
      operator
      direction
      stopSequence
      busStopCode
      busStop {
        busStopCode
        roadName
        description
        latitude
        longitude
      }
      distance
      wdFirstBus
      wdLastBus
      satFirstBus
      satLastBus
      sunFirstBus
      sunLastBus
    }
  }
`;

function BusServiceRoutes(props: any): JSX.Element {
  const route = useRoute();

  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  const [theme, setTheme] = useState('light');

  const [isSwitchOn, setIsSwitchOn] = useState(true);

  const [responseData, setResponseData] = useState<any>(null);

  const [getBusRouteByBusServiceNo, { loading, error, data, client }] = useLazyQuery(GET_BUS_ROUTE_BY_BUS_SERVICE_NO);

  console.log('loading = ', loading);
  console.log('error = ', error);
  console.log('data = ', data);

  useEffect(() => {
    getThemeData();
    props.navigation.addListener('focus', () => {
      getThemeData();
    });
    getUserCurrentLocation();
  }, []);

  useEffect(() => {
    if (route.params) {
      const busServiceNo = (route.params as any).busServiceNo;
      getBusRouteByBusServiceNo({
        variables: { busServiceNo: busServiceNo },
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

  const onRefresh = async () => {
    setRefreshing(true);

    getThemeData();
    client?.clearStore();
    setResponseData(null);
    if (route.params) {
      const busServiceNo = (route.params as any).busServiceNo;
      getBusRouteByBusServiceNo({
        variables: { busServiceNo: busServiceNo },
      });
    }

    if (!loading) {
      setRefreshing(false);
    }
  };

  const onToggleSwitch = () => {
    if (isSwitchOn) {
      setIsSwitchOn(false);
    } else {
      setIsSwitchOn(true);
    }
  };

  const getUserCurrentLocation = () => {
    const singaporeLatitude = 1.3521;
    const singaporeLongitude = 103.8198;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          console.log('latitude = ', location.coords.latitude);
          console.log('longitude = ', location.coords.longitude);

          setLatitude(location.coords.latitude);
          setLongitude(location.coords.longitude);
        } else {
          setLatitude(singaporeLatitude);
          setLongitude(singaporeLongitude);
        }
      } catch (e) {
        console.log('error = ', e);
      }
    })();
  };

  const handleBackButtonClick = () => {
    props.navigation.goBack();
  };

  const renderBusServiceRoutesResultDiv = () => {
    let busServiceRoutesResultDiv = (
      <View style={styles.noDataContainer}>
        <Text>There is no data</Text>
      </View>
    );

    if (loading) {
      busServiceRoutesResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (error) {
        busServiceRoutesResultDiv = (
          <View style={styles.errorContainer}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (responseData && responseData.busRouteByBusServiceNo) {
          const groupedBusRouteByBusServiceNo = _.groupBy(responseData.busRouteByBusServiceNo, 'direction');
          const inboundList = groupedBusRouteByBusServiceNo['1'];
          const outboundList = groupedBusRouteByBusServiceNo['2'];

          let inboundFrom = '';
          let inboundTo = '';
          if (inboundList) {
            inboundFrom = inboundList[0].busStop.description;
            inboundTo = inboundList[inboundList.length - 1].busStop.description;
          }

          let outboundFrom = '';
          let outboundTo = '';
          if (outboundList) {
            outboundFrom = outboundList[0].busStop.description;
            outboundTo = outboundList[outboundList.length - 1].busStop.description;
          }

          busServiceRoutesResultDiv = (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch value={isSwitchOn} onValueChange={onToggleSwitch} color="tomato" />
                {renderSwitchText(isSwitchOn, inboundFrom, inboundTo, outboundFrom, outboundTo)}
              </View>

              {renderBusServiceRoutesList(isSwitchOn, inboundList, outboundList)}
            </View>
          );
        }
      }
    }

    return busServiceRoutesResultDiv;
  };

  const renderSwitchText = (
    isSwitchOn: boolean,
    inboundFrom: string,
    inboundTo: string,
    outboundFrom: string,
    outboundTo: string,
  ) => {
    let switchText = null;

    if (isSwitchOn) {
      if (inboundFrom && inboundTo) {
        switchText = (
          <Text
            style={{
              fontSize: 15,
              color: theme === 'light' ? 'black' : 'white',
              marginLeft: 8,
            }}
          >
            {`From ${inboundFrom} to ${inboundTo}`}
          </Text>
        );
      }
    } else {
      if (outboundFrom && outboundTo) {
        switchText = (
          <Text
            style={{
              fontSize: 15,
              color: theme === 'light' ? 'black' : 'white',
              marginLeft: 8,
            }}
          >
            {`From ${outboundFrom} to ${outboundTo}`}
          </Text>
        );
      }
    }

    return switchText;
  };

  const renderBusServiceRoutesList = (isSwitchOn: boolean, inboundList: any[], outboundList: any[]) => {
    let busServiceRoutesList = null;

    if (isSwitchOn) {
      if (inboundList) {
        busServiceRoutesList = inboundList.map((item: any, i: number) => {
          let view = null;

          if (item.busStop) {
            if (
              _.inRange(latitude, item.busStop.latitude - 0.003, item.busStop.latitude + 0.003) &&
              _.inRange(longitude, item.busStop.longitude - 0.003, item.busStop.longitude + 0.003)
            ) {
              view = (
                <View key={i} style={styles.busServiceRoutesContainer}>
                  {/* <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 8 }}>{item.stopSequence}</Text> */}
                  <Text style={{ fontSize: 16, color: 'red', fontWeight: 'bold', marginVertical: 6 }}>
                    {item.busStop.description}
                  </Text>
                  <Text style={{ fontSize: 14, color: 'red', fontWeight: 'bold', marginVertical: 6 }}>
                    {item.busStop.busStopCode}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCheckBusStopInMap(item.busStop.latitude, item.busStop.longitude)}
                  >
                    <Text style={{ color: 'blue', textDecorationLine: 'underline', marginVertical: 5 }}>
                      Check bus stop in map
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            } else {
              view = (
                <View key={i} style={styles.busServiceRoutesContainer}>
                  {/* <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 8 }}>{item.stopSequence}</Text> */}
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 6 }}>
                    {item.busStop.description}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', marginVertical: 6 }}>
                    {item.busStop.busStopCode}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCheckBusStopInMap(item.busStop.latitude, item.busStop.longitude)}
                  >
                    <Text style={{ color: 'blue', textDecorationLine: 'underline', marginVertical: 5 }}>
                      Check bus stop in map
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }

            return view;
          }
        });
      }
    } else {
      if (outboundList) {
        busServiceRoutesList = outboundList.map((item: any, i: number) => {
          let view = null;

          if (item.busStop) {
            if (
              _.inRange(latitude, item.busStop.latitude - 0.003, item.busStop.latitude + 0.003) &&
              _.inRange(longitude, item.busStop.longitude - 0.003, item.busStop.longitude + 0.003)
            ) {
              view = (
                <View key={i} style={styles.busServiceRoutesContainer}>
                  {/* <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 8 }}>{item.stopSequence}</Text> */}
                  <Text style={{ fontSize: 16, color: 'red', fontWeight: 'bold', marginVertical: 6 }}>
                    {item.busStop.description}
                  </Text>
                  <Text style={{ fontSize: 14, color: 'red', fontWeight: 'bold', marginVertical: 6 }}>
                    {item.busStop.busStopCode}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCheckBusStopInMap(item.busStop.latitude, item.busStop.longitude)}
                  >
                    <Text style={{ color: 'blue', textDecorationLine: 'underline', marginVertical: 5 }}>
                      Check bus stop in map
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            } else {
              view = (
                <View key={i} style={styles.busServiceRoutesContainer}>
                  {/* <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 8 }}>{item.stopSequence}</Text> */}
                  <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 6 }}>
                    {item.busStop.description}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', marginVertical: 6 }}>
                    {item.busStop.busStopCode}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleCheckBusStopInMap(item.busStop.latitude, item.busStop.longitude)}
                  >
                    <Text style={{ color: 'blue', textDecorationLine: 'underline', marginVertical: 5 }}>
                      Check bus stop in map
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }

            return view;
          }
        });
      }
    }

    return busServiceRoutesList;
  };

  const handleCheckBusStopInMap = (latitude: number, longitude: number) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = 'Bus stop';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
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
          Bus Service Routes
        </Text>

        <View style={{ marginVertical: 10 }}></View>

        {renderBusServiceRoutesResultDiv()}
      </View>
    </ScrollView>
  );
}

export default BusServiceRoutes;

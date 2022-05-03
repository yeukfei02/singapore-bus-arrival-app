import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, View, RefreshControl, TouchableOpacity, Platform, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { gql, useLazyQuery } from '@apollo/client';
import { useRoute } from '@react-navigation/native';
import { Switch } from 'react-native-paper';

import { getAsyncStorageData } from '../../helpers/helpers';
import _ from 'lodash';

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
    padding: 20,
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

          busServiceRoutesResultDiv = (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Switch value={isSwitchOn} onValueChange={onToggleSwitch} color="tomato" />
                <Text
                  style={{
                    fontSize: 20,
                    color: theme === 'light' ? 'black' : 'white',
                    marginLeft: 8,
                  }}
                >
                  {isSwitchOn ? `Inbound` : `Outbound`}
                </Text>
              </View>

              {renderBusServiceRoutesList(isSwitchOn, groupedBusRouteByBusServiceNo)}
            </View>
          );
        }
      }
    }

    return busServiceRoutesResultDiv;
  };

  const renderBusServiceRoutesList = (isSwitchOn: boolean, groupedBusRouteByBusServiceNo: any) => {
    let busServiceRoutesList = null;

    if (isSwitchOn) {
      const inboundList = groupedBusRouteByBusServiceNo['1'];
      if (inboundList) {
        busServiceRoutesList = inboundList.map((item: any, i: number) => {
          if (item.busStop) {
            return (
              <View key={i} style={styles.busServiceRoutesContainer}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 8 }}>{item.stopSequence}</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 6 }}>
                  Bus Stop Code: {item.busStop.busStopCode}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 6 }}>
                  Road Name: {item.busStop.roadName}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 6 }}>
                  Description: {item.busStop.description}
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
        });
      }
    } else {
      const outboundList = groupedBusRouteByBusServiceNo['2'];
      if (outboundList) {
        busServiceRoutesList = outboundList.map((item: any, i: number) => {
          if (item.busStop) {
            return (
              <View key={i} style={styles.busServiceRoutesContainer}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginVertical: 8 }}>{item.stopSequence}</Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 6 }}>
                  Bus Stop Code: {item.busStop.busStopCode}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 6 }}>
                  Road Name: {item.busStop.roadName}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 6 }}>
                  Description: {item.busStop.description}
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

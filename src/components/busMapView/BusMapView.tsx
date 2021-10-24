import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { gql, useLazyQuery } from '@apollo/client';

import { getAsyncStorageData } from '../../common/common';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

const GET_BUS_SERVICE_BY_BUS_SERVICE_NO = gql`
  query busServiceByBusServiceNo($busServiceNo: String!) {
    busServiceByBusServiceNo(busServiceNo: $busServiceNo) {
      serviceNo
      operator
      direction
      category
      originCode
      originBusStop {
        busStopCode
        roadName
        description
        latitude
        longitude
      }
      destinationCode
      destinationBusStop {
        busStopCode
        roadName
        description
        latitude
        longitude
      }
      amPeakFreq
      amOffpeakFreq
      pmPeakFreq
      pmOffpeakFreq
      loopDesc
    }
  }
`;

const singaporeLatitude = 1.3521;
const singaporeLongitude = 103.8198;

function BusMapView(props: any): JSX.Element {
  const route = useRoute();

  const [theme, setTheme] = useState('light');

  const [camera, setCamera] = useState({
    center: {
      latitude: singaporeLatitude,
      longitude: singaporeLongitude,
    },
    pitch: 12,
    heading: 12,

    // Only on iOS MapKit, in meters. The property is ignored by Google Maps.
    altitude: 80000,

    // Only when using Google Maps.
    zoom: 12,
  });

  const [responseData, setResponseData] = useState<any>(null);

  const [refreshing, setRefreshing] = useState(false);

  const [getBusServiceByBusServiceNo, { loading, error, data, client }] = useLazyQuery(
    GET_BUS_SERVICE_BY_BUS_SERVICE_NO,
  );

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
      getBusServiceByBusServiceNo({
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

  const onRefresh = () => {
    setRefreshing(true);

    getThemeData();
    client?.clearStore();
    setResponseData(null);
    if (route.params) {
      const busServiceNo = (route.params as any).busServiceNo;
      getBusServiceByBusServiceNo({
        variables: { busServiceNo: busServiceNo },
      });
    }

    if (!loading) {
      setRefreshing(false);
    }
  };

  const handleBackButtonClick = () => {
    props.navigation.goBack();
  };

  const renderBusMapViewResultDiv = () => {
    let busMapViewResultDiv = (
      <View style={styles.noDataContainer}>
        <ActivityIndicator size="large" color="tomato" />
      </View>
    );

    if (loading) {
      busMapViewResultDiv = (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="tomato" />
        </View>
      );
    } else {
      if (error) {
        busMapViewResultDiv = (
          <View style={styles.errorContainer}>
            <ActivityIndicator size="large" color="tomato" />
          </View>
        );
      } else {
        if (responseData && responseData.busServiceByBusServiceNo) {
          const markerList: any[] = [];
          const coordinatesList: any[] = [];

          responseData.busServiceByBusServiceNo.forEach((item: any, i: number) => {
            if (item.originBusStop && item.destinationBusStop) {
              if (item.direction === 1) {
                setData(item, markerList, coordinatesList);
              }
            }
          });

          busMapViewResultDiv = (
            <View style={styles.mapContainer}>
              <MapView style={styles.map} camera={camera}>
                {renderMarkers(markerList)}
                {renderPolyline(coordinatesList)}
              </MapView>

              <View
                style={{
                  position: 'absolute',
                  top: '8%',
                  left: '6%',
                  alignSelf: 'flex-start',
                }}
              >
                <TouchableOpacity onPress={() => handleBackButtonClick()}>
                  <MaterialIcons name="arrow-back" size={24} color={theme === 'light' ? 'black' : 'white'} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }
      }
    }

    return busMapViewResultDiv;
  };

  const setData = (item: any, markerList: any[], coordinatesList: any[]) => {
    // marker
    const originBusStopLatLng = {
      title: item.originBusStop.roadName,
      description: item.originBusStop.description,
      latlng: {
        latitude: item.originBusStop.latitude,
        longitude: item.originBusStop.longitude,
      },
    };
    markerList.push(originBusStopLatLng);

    const destinationBusStopLatLng = {
      title: item.destinationBusStop.roadName,
      description: item.destinationBusStop.description,
      latlng: {
        latitude: item.destinationBusStop.latitude,
        longitude: item.destinationBusStop.longitude,
      },
    };
    markerList.push(destinationBusStopLatLng);

    // coordinates
    const originBusStopCoordinates = {
      latitude: item.originBusStop.latitude,
      longitude: item.originBusStop.longitude,
    };
    coordinatesList.push(originBusStopCoordinates);

    const destinationBusStopCoordinates = {
      latitude: item.destinationBusStop.latitude,
      longitude: item.destinationBusStop.longitude,
    };
    coordinatesList.push(destinationBusStopCoordinates);
  };

  const renderMarkers = (markerList: any[]) => {
    let markers: any[] = [];

    if (markerList) {
      markers = markerList.map((marker: any, i: number) => {
        return <Marker key={i} coordinate={marker.latlng} title={marker.title} description={marker.description} />;
      });
    }

    return markers;
  };

  const renderPolyline = (coordinatesList: any[]) => {
    const polyline = (
      <Polyline
        coordinates={coordinatesList}
        strokeColor="#FF6347" // fallback for when `strokeColors` is not supported by the map-provider
        strokeColors={['tomato']}
        strokeWidth={5}
      />
    );
    return polyline;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme === 'light' ? 'white' : 'black' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['tomato', 'tomato', 'black']} />
      }
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.container}>{renderBusMapViewResultDiv()}</View>
    </ScrollView>
  );
}

export default BusMapView;

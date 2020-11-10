import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, View, RefreshControl, Platform, TouchableOpacity, Linking } from 'react-native';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash';

import { gql, useLazyQuery, useMutation } from '@apollo/client';

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
  busStopByLatLongResultContainer: {
    backgroundColor: 'gainsboro',
    padding: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  busStopByLatLongResultDescriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  busStopByLatLongResultRoadNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
});

const GET_BUS_STOP_BY_LATLONG = gql`
  query busStopByLatLong($latitude: Float!, $longitude: Float!, $pageNumber: Int!) {
    busStopByLatLong(latitude: $latitude, longitude: $longitude, pageNumber: $pageNumber) {
      busStopCode
      roadName
      description
      latitude
      longitude
    }
  }
`;

const ADD_FAVOURITES = gql`
  mutation addFavourites($data: AddFavourites!) {
    addFavourites(data: $data) {
      status
    }
  }
`;

function NearMe(props: any): JSX.Element {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [refreshing, setRefreshing] = useState(false);

  const [theme, setTheme] = useState('light');

  const [responseData, setResponseData] = useState<any>(null);

  const [getBusStopByLatLong, record] = useLazyQuery(GET_BUS_STOP_BY_LATLONG);

  const [addFavourites, addFavouritesResult] = useMutation(ADD_FAVOURITES);

  console.log('loading = ', record.loading);
  console.log('error = ', record.error);
  console.log('data = ', record.data);

  console.log('addFavouritesResult.data = ', addFavouritesResult.data);

  useEffect(() => {
    getUserCurrentLocation();
    getThemeData();
    props.navigation.addListener('focus', () => {
      getThemeData();
    });
  }, []);

  useEffect(() => {
    if (latitude != 0 && longitude != 0) {
      getBusStopByLatLong({
        variables: { latitude: latitude, longitude: longitude, pageNumber: pageNumber },
      });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (record.data) {
      setResponseData(record.data);
    }
  }, [record.data]);

  const getUserCurrentLocation = async () => {
    const singaporeLatitude = 1.3521;
    const singaporeLongitude = 103.8198;

    navigator.geolocation.getCurrentPosition((position: any) => {
      if (position && position.coords) {
        console.log('latitude = ', position.coords.latitude);
        console.log('longitude = ', position.coords.longitude);
        if (
          _.inRange(position.coords.latitude, singaporeLatitude - 0.5, singaporeLatitude + 0.5) &&
          _.inRange(position.coords.longitude, singaporeLongitude - 0.5, singaporeLongitude + 0.5)
        ) {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        } else {
          setLatitude(singaporeLatitude);
          setLongitude(singaporeLongitude);
        }
      } else {
        setLatitude(singaporeLatitude);
        setLongitude(singaporeLongitude);
      }
    });
  };

  const getThemeData = async () => {
    const theme = await getAsyncStorageData('@theme');
    if (theme) {
      setTheme(theme);
    }
  };

  const renderGetBusStopByLatLongResult = () => {
    let getBusStopByLatLongResultDiv = (
      <View style={styles.noDataContainer}>
        <Text>There is no data</Text>
      </View>
    );

    if (record.loading) {
      getBusStopByLatLongResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (record.error) {
        getBusStopByLatLongResultDiv = (
          <View style={styles.errorContainer}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (responseData && responseData.busStopByLatLong) {
          getBusStopByLatLongResultDiv = responseData.busStopByLatLong.map((item: any, i: number) => {
            return (
              <View key={i} style={styles.busStopByLatLongResultContainer}>
                <Text style={styles.busStopByLatLongResultDescriptionText}>{item.description}</Text>
                <Text style={styles.busStopByLatLongResultRoadNameText}>{item.roadName}</Text>

                <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                  <Text style={{ fontSize: 22 }}>Bus Stop Code: </Text>
                  <TouchableOpacity onPress={() => handleBusStopCodeClick(item.busStopCode)}>
                    <Text style={{ fontSize: 22, color: 'red', textDecorationLine: 'underline' }}>
                      {item.busStopCode}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ alignSelf: 'flex-start', marginVertical: 10 }}>
                  <TouchableOpacity onPress={() => handleOpenInMap(item.latitude, item.longitude)}>
                    <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Open in map</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ alignSelf: 'flex-start', marginTop: 5 }}>
                  <TouchableOpacity onPress={() => handleFavouriteIconClick(item)}>
                    <MaterialIcons name="favorite" size={30} color="tomato" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          });
        }
      }
    }

    return getBusStopByLatLongResultDiv;
  };

  const renderShowMoreButton = () => {
    let showMoreButton = null;

    if (responseData) {
      showMoreButton = (
        <TouchableOpacity style={{ marginVertical: 10 }} onPress={() => handleShowMoreButtonClick()}>
          <View style={{ backgroundColor: 'tomato', padding: 15, borderRadius: 5 }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'white' }}>SHOW MORE</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return showMoreButton;
  };

  const handleFavouriteIconClick = (item: any) => {
    const installationId = Constants.installationId;
    const newItem = {
      busStopCode: item.busStopCode,
      description: item.description,
      latitude: item.latitude,
      longitude: item.longitude,
      roadName: item.roadName,
    };

    if (installationId && newItem) {
      addFavourites({
        variables: {
          data: {
            installationId: installationId,
            item: newItem,
          },
        },
      });
    }
  };

  const handleBusStopCodeClick = (busStopCode: string) => {
    props.navigation.navigate(`BusArrivalDetails`, {
      busStopCode: busStopCode,
    });
  };

  const handleOpenInMap = (latitude: number, longitude: number) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${latitude},${longitude}`;
    const label = 'Bus Stop';
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
    setPageNumber(1);
    record.client?.clearStore();
    setResponseData(null);
    getBusStopByLatLong({
      variables: { latitude: latitude, longitude: longitude, pageNumber: pageNumber },
    });

    if (!record.loading) {
      setRefreshing(false);
    }
  };

  const handleShowMoreButtonClick = () => {
    let newPageNumber = pageNumber;
    newPageNumber += 1;
    setPageNumber(newPageNumber);

    getBusStopByLatLong({
      variables: { latitude: latitude, longitude: longitude, pageNumber: newPageNumber },
    });
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
        <Text style={{ fontSize: 25, fontWeight: 'bold', color: theme === 'light' ? 'black' : 'white' }}>NearMe</Text>

        <View style={{ marginVertical: 10 }}></View>

        {renderGetBusStopByLatLongResult()}

        {renderShowMoreButton()}
      </View>
    </ScrollView>
  );
}

export default NearMe;

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ScrollView, View, RefreshControl } from 'react-native';

import { gql, useQuery } from '@apollo/client';

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

const GET_BUS_STOP_BY_LATLONG = gql`
  query busStopByLatLong($latitude: Float!, $longitude: Float!) {
    busStopByLatLong(latitude: $latitude, longitude: $longitude) {
      busStopCode
      roadName
      description
      latitude
      longitude
    }
  }
`;

function NearMe(): JSX.Element {
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [refreshing, setRefreshing] = useState(false);

  const { loading, error, data } = useQuery(GET_BUS_STOP_BY_LATLONG, {
    variables: { latitude: latitude, longitude: longitude },
  });

  console.log('loading = ', loading);
  console.log('error = ', error);
  console.log('data = ', data);

  useEffect(() => {
    getUserCurrentLocation();
  }, []);

  //   useEffect(() => {
  //     if (latitude != 0 && longitude != 0) {
  //       getBusStopByLatLong({
  //         variables: {
  //           latitude: latitude,
  //           longitude: longitude,
  //         },
  //       });
  //     }
  //   }, [latitude, longitude]);

  const getUserCurrentLocation = async () => {
    navigator.geolocation.getCurrentPosition((position: any) => {
      if (position && position.coords) {
        console.log('latitude = ', position.coords.latitude);
        console.log('longitude = ', position.coords.longitude);
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      }
    });

    // sg location
    // setLatitude(1.352083);
    // setLongitude(103.819839);
  };

  const renderGetBusStopByLatLongResult = () => {
    let getBusStopByLatLongResultDiv = (
      <View style={{ backgroundColor: 'lightgray', padding: 20, borderRadius: 5 }}>
        <Text>There is no data</Text>
      </View>
    );

    if (loading) {
      getBusStopByLatLongResultDiv = (
        <View style={{ backgroundColor: 'gold', padding: 20, borderRadius: 5 }}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (error) {
        getBusStopByLatLongResultDiv = (
          <View style={{ backgroundColor: 'tomato', padding: 20, borderRadius: 5 }}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (data && data.busStopByLatLong) {
          getBusStopByLatLongResultDiv = data.busStopByLatLong.map((item: any, i: number) => {
            return (
              <View key={i} style={{ backgroundColor: 'lightgray', padding: 20, borderRadius: 5 }}>
                <Text>{item.busStopCode}</Text>
                <Text>{item.roadName}</Text>
                <Text>{item.latitude}</Text>
                <Text>{item.longitude}</Text>
              </View>
            );
          });
        }
      }
    }

    return getBusStopByLatLongResultDiv;
  };

  const onRefresh = () => {
    setRefreshing(true);

    if (!loading) {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.viewContainer}>
        <Text style={{ fontSize: 20 }}>NearMe</Text>

        <View style={{ marginVertical: 10 }}></View>

        {renderGetBusStopByLatLongResult()}
      </View>
    </ScrollView>
  );
}

export default NearMe;

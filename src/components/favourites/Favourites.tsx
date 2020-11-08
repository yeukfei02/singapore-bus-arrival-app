import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';

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
  favouritesResultContainer: {
    backgroundColor: 'gainsboro',
    padding: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  favouritesResultDescriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  favouritesResultRoadNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
});

const GET_FAVOURITES_BY_INSTALLATION_ID = gql`
  query getFavouritesByInstallationId($installationId: String!) {
    getFavouritesByInstallationId(installationId: $installationId) {
      id
      installation_id
      item {
        bus_stop_code
        description
        latitude
        longitude
        road_name
      }
      createdAt
      updatedAt
    }
  }
`;

function Favourites(props: any): JSX.Element {
  const [theme, setTheme] = useState('light');

  const [refreshing, setRefreshing] = useState(false);

  const [responseData, setResponseData] = useState<any>(null);

  const [getFavouritesByInstallationId, record] = useLazyQuery(GET_FAVOURITES_BY_INSTALLATION_ID);

  console.log('record.loading = ', record.loading);
  console.log('record.error = ', record.error);
  console.log('record.data = ', record.data);

  useEffect(() => {
    getThemeData();
    props.navigation.addListener('focus', () => {
      getThemeData();
    });
  }, []);

  useEffect(() => {
    if (Constants.installationId) {
      getFavouritesByInstallationId({
        variables: {
          installationId: Constants.installationId,
        },
      });
    }
  }, [Constants.installationId]);

  useEffect(() => {
    if (record.data) {
      setResponseData(record.data);
    }
  }, [record.data]);

  const getThemeData = async () => {
    const theme = await getAsyncStorageData('@theme');
    if (theme) {
      setTheme(theme);
    }
  };

  const renderFavouritesList = () => {
    let favouritesListDiv = (
      <View style={styles.noDataContainer}>
        <Text>There is no data</Text>
      </View>
    );

    if (record.loading) {
      favouritesListDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (record.error) {
        favouritesListDiv = (
          <View style={styles.errorContainer}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (responseData) {
          if (responseData.getFavouritesByInstallationId) {
            favouritesListDiv = responseData.getFavouritesByInstallationId.map((element: any, i: number) => {
              const item = element.item;

              return (
                <View key={i} style={styles.favouritesResultContainer}>
                  <Text style={styles.favouritesResultDescriptionText}>{item.description}</Text>
                  <Text style={styles.favouritesResultRoadNameText}>{item.road_name}</Text>

                  <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                    <Text style={{ fontSize: 22 }}>Bus Stop Code: </Text>
                    <TouchableOpacity onPress={() => handleBusStopCodeClick(item.bus_stop_code)}>
                      <Text style={{ fontSize: 22, color: 'red', textDecorationLine: 'underline' }}>
                        {item.bus_stop_code}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ alignSelf: 'flex-start', marginVertical: 10 }}>
                    <TouchableOpacity onPress={() => handleOpenInGoogleMap(item.latitude, item.longitude)}>
                      <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Open in google map</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ alignSelf: 'flex-start', marginTop: 5 }}>
                    <MaterialIcons name="favorite" size={30} color="tomato" />
                  </View>
                </View>
              );
            });
          }
        }
      }
    }

    return favouritesListDiv;
  };

  const handleBusStopCodeClick = (busStopCode: string) => {
    props.navigation.navigate(`BusArrivalDetails`, {
      busStopCode: busStopCode,
    });
  };

  const handleOpenInGoogleMap = (latitude: number, longitude: number) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
  };

  const onRefresh = () => {
    setRefreshing(true);

    getThemeData();
    record.client?.clearStore();
    setResponseData(null);
    getFavouritesByInstallationId({
      variables: {
        installationId: Constants.installationId,
      },
    });

    if (!record.loading) {
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
        <Text style={{ fontSize: 25, fontWeight: 'bold', color: theme === 'light' ? 'black' : 'white' }}>
          Favourites
        </Text>

        <View style={{ marginVertical: 10 }}></View>

        {renderFavouritesList()}
      </View>
    </ScrollView>
  );
}

export default Favourites;

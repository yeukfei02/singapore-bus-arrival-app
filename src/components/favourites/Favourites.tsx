import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, Platform, TouchableOpacity, Linking } from 'react-native';
import { Button, Portal, Paragraph, Dialog } from 'react-native-paper';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';

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

const DELETE_FAVOURITES_BY_ID = gql`
  mutation deleteFavouritesById($data: DeleteFavourites!) {
    deleteFavouritesById(data: $data) {
      status
    }
  }
`;

function Favourites(props: any): JSX.Element {
  const [theme, setTheme] = useState('light');

  const [refreshing, setRefreshing] = useState(false);

  const [responseData, setResponseData] = useState<any>(null);

  const [visible, setVisible] = useState(false);

  const [id, setId] = useState('');

  const [getFavouritesByInstallationId, { loading, error, data, client }] = useLazyQuery(
    GET_FAVOURITES_BY_INSTALLATION_ID,
  );

  const [deleteFavouritesById, deleteFavouritesResult] = useMutation(DELETE_FAVOURITES_BY_ID);

  console.log('loading = ', loading);
  console.log('error = ', error);
  console.log('data = ', data);

  console.log('deleteFavouritesResult.data = ', deleteFavouritesResult.data);

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

  const renderFavouritesList = () => {
    let favouritesListDiv = (
      <View style={styles.noDataContainer}>
        <Text>There is no data</Text>
      </View>
    );

    if (loading) {
      favouritesListDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (error) {
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
                  <View style={{ alignSelf: 'flex-end' }}>
                    <TouchableOpacity onPress={() => handleDeleteButtonClick(element.id)}>
                      <MaterialIcons name="delete" size={30} color="black" />
                    </TouchableOpacity>
                  </View>

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
                    <TouchableOpacity onPress={() => handleOpenInMap(item.latitude, item.longitude)}>
                      <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Open in map</Text>
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

  const handleDeleteButtonClick = (id: string) => {
    setVisible(true);

    if (id) setId(id);
  };

  const onRefresh = () => {
    setRefreshing(true);

    getThemeData();
    client?.clearStore();
    setResponseData(null);
    getFavouritesByInstallationId({
      variables: {
        installationId: Constants.installationId,
      },
    });

    if (!loading) {
      setRefreshing(false);
    }
  };

  const handleConfirmButtonClick = () => {
    setVisible(false);

    if (id && Constants.installationId) {
      deleteFavouritesById({
        variables: {
          data: {
            id: id,
            installationId: Constants.installationId,
          },
        },
      });
    }
  };

  const handleCancalButtonClick = () => {
    setVisible(false);
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

        <Portal>
          <Dialog visible={visible}>
            <Dialog.Title>Delete favourites</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Are you sure want to delete this favourite?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button color="#1197d5" onPress={handleCancalButtonClick}>
                Cancel
              </Button>
              <Button onPress={handleConfirmButtonClick}>Confirm</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </ScrollView>
  );
}

export default Favourites;

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  View,
  RefreshControl,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';
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
  busStopResultContainer: {
    backgroundColor: 'gainsboro',
    padding: 20,
    borderRadius: 5,
    marginVertical: 10,
  },
  busStopResultDescriptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  busStopResultRoadNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
});

const GET_BUS_STOP_BY_ROAD_NAME = gql`
  query busStopByRoadName($roadName: String!) {
    busStopByRoadName(roadName: $roadName) {
      busStopCode
      roadName
      description
      latitude
      longitude
    }
  }
`;

const GET_BUS_STOP_BY_DESCRIPTION = gql`
  query busStopByDescription($description: String!) {
    busStopByDescription(description: $description) {
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

function Search(props: any): JSX.Element {
  const [roadName, setRoadName] = useState('');
  const [placeName, setPlaceName] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const [theme, setTheme] = useState('light');

  const [recordData, setRecordData] = useState<any>(null);
  const [record2Data, setRecord2Data] = useState<any>(null);

  const [visible, setVisible] = useState(false);

  const [item, setItem] = useState<any>({});

  const [getBusStopByRoadName, record] = useLazyQuery(GET_BUS_STOP_BY_ROAD_NAME);
  const [getBusStopByDescrition, record2] = useLazyQuery(GET_BUS_STOP_BY_DESCRIPTION);

  const [addFavourites, addFavouritesResult] = useMutation(ADD_FAVOURITES);

  console.log('record loading = ', record.loading);
  console.log('record error = ', record.error);
  console.log('record data = ', record.data);

  console.log('record2 loading = ', record2.loading);
  console.log('record2 error = ', record2.error);
  console.log('record2 data = ', record2.data);

  console.log('addFavouritesResult.data = ', addFavouritesResult.data);

  useEffect(() => {
    getThemeData();
    props.navigation.addListener('focus', () => {
      getThemeData();
    });
  }, []);

  useEffect(() => {
    if (roadName && roadName.length > 3) {
      getBusStopByRoadName({ variables: { roadName: roadName } });
    }
  }, [roadName]);

  useEffect(() => {
    if (placeName && placeName.length > 3) {
      getBusStopByDescrition({ variables: { description: placeName } });
    }
  }, [placeName]);

  useEffect(() => {
    if (record.data) {
      setRecordData(record.data);
    }
  }, [record.data]);

  useEffect(() => {
    if (record2.data) {
      setRecord2Data(record2.data);
    }
  }, [record2.data]);

  const getThemeData = async () => {
    const theme = await getAsyncStorageData('@theme');
    if (theme) {
      setTheme(theme);
    }
  };

  const handleRoadNameChange = (text: string) => {
    setRecordData(null);
    setRecord2Data(null);

    setRoadName(text);
  };

  const handlePlaceNameChange = (text: string) => {
    setRecordData(null);
    setRecord2Data(null);

    setPlaceName(text);
  };

  const renderBusStopResultDiv = () => {
    let busStopResultDiv = (
      <View style={styles.noDataContainer}>
        <Text>There is no data</Text>
      </View>
    );

    if (record.loading) {
      busStopResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (record.error) {
        busStopResultDiv = (
          <View style={styles.errorContainer}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (recordData) {
          if (recordData.busStopByRoadName) {
            busStopResultDiv = recordData.busStopByRoadName.map((item: any, i: number) => {
              return (
                <View key={i} style={styles.busStopResultContainer}>
                  <Text style={styles.busStopResultDescriptionText}>{item.description}</Text>
                  <Text style={styles.busStopResultRoadNameText}>{item.roadName}</Text>

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
    }

    if (record2.loading) {
      busStopResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (record2.error) {
        busStopResultDiv = (
          <View style={styles.errorContainer}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (record2Data) {
          if (record2Data.busStopByDescription) {
            busStopResultDiv = record2Data.busStopByDescription.map((item: any, i: number) => {
              return (
                <View key={i} style={styles.busStopResultContainer}>
                  <Text style={styles.busStopResultDescriptionText}>{item.description}</Text>
                  <Text style={styles.busStopResultRoadNameText}>{item.roadName}</Text>

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
    }

    return busStopResultDiv;
  };

  const handleFavouriteIconClick = (item: any) => {
    setVisible(true);
    setItem(item);
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
    setRoadName('');
    setPlaceName('');
    setRecordData(null);
    setRecord2Data(null);

    if (!record.loading && !record2.loading) {
      setRefreshing(false);
    }
  };

  const handleConfirmButtonClick = () => {
    setVisible(false);

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
        <Text style={{ fontSize: 25, fontWeight: 'bold', color: theme === 'light' ? 'black' : 'white' }}>Search</Text>

        <View style={{ marginVertical: 10 }}></View>

        <TextInput
          style={{
            height: 60,
            padding: 10,
            backgroundColor: 'gainsboro',
            borderColor: 'black',
            borderWidth: 1,
            borderRadius: 5,
            opacity: 0.7,
          }}
          placeholder="Roadname"
          placeholderTextColor="black"
          onChangeText={(text) => handleRoadNameChange(text)}
          value={roadName}
        />

        <View style={{ marginVertical: 10 }}></View>

        <TextInput
          style={{
            height: 60,
            padding: 10,
            backgroundColor: 'gainsboro',
            borderColor: 'black',
            borderWidth: 1,
            borderRadius: 5,
            opacity: 0.7,
          }}
          placeholder="Place"
          placeholderTextColor="black"
          onChangeText={(text) => handlePlaceNameChange(text)}
          value={placeName}
        />

        <View style={{ marginVertical: 10 }}></View>

        {renderBusStopResultDiv()}

        <Portal>
          <Dialog visible={visible}>
            <Dialog.Title>Add favourites</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Are you sure want to add to favourites?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleCancalButtonClick}>Cancel</Button>
              <Button onPress={handleConfirmButtonClick}>Confirm</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </ScrollView>
  );
}

export default Search;

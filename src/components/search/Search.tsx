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
import CustomRadioButton from '../customRadioButton/CustomRadioButton';

import { gql, useLazyQuery, useMutation } from '@apollo/client';

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
  busServiceResultServiceNoText: {
    fontSize: 20,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
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

const GET_BUS_STOP_BY_BUS_STOP_CODE = gql`
  query busStopByBusStopCode($busStopCode: String!) {
    busStopByBusStopCode(busStopCode: $busStopCode) {
      busStopCode
      roadName
      description
      latitude
      longitude
    }
  }
`;

const GET_ALL_BUS_SERVICE = gql`
  query allBusService($busServiceNo: String) {
    allBusService(busServiceNo: $busServiceNo) {
      serviceNo
      operator
      direction
      category
      originCode
      destinationCode
      amPeakFreq
      amOffpeakFreq
      pmPeakFreq
      pmOffpeakFreq
      loopDesc
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
  const [searchByRoadNamePlaceBusStopCodeChecked, setSearchByRoadNamePlaceBusStopCodeChecked] = useState(true);
  const [searchByBusServiceChecked, setSearchByBusServiceChecked] = useState(false);

  const [roadName, setRoadName] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [busStopCode, setBusStopCode] = useState('');
  const [busService, setBusService] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const [theme, setTheme] = useState('light');

  const [recordData, setRecordData] = useState<any>(null);
  const [record2Data, setRecord2Data] = useState<any>(null);
  const [record3Data, setRecord3Data] = useState<any>(null);
  const [record4Data, setRecord4Data] = useState<any>(null);

  const [visible, setVisible] = useState(false);

  const [item, setItem] = useState<any>({});

  const [getBusStopByRoadName, getBusStopByRoadNameResult] = useLazyQuery(GET_BUS_STOP_BY_ROAD_NAME);
  const [getBusStopByDescription, getBusStopByDescriptionResult] = useLazyQuery(GET_BUS_STOP_BY_DESCRIPTION);
  const [getBusStopByBusStopCode, getBusStopByBusStopCodeResult] = useLazyQuery(GET_BUS_STOP_BY_BUS_STOP_CODE);
  const [getAllBusService, getAllBusServiceResult] = useLazyQuery(GET_ALL_BUS_SERVICE);

  const [addFavourites, addFavouritesResult] = useMutation(ADD_FAVOURITES);

  console.log('getBusStopByRoadNameResult loading = ', getBusStopByRoadNameResult.loading);
  console.log('getBusStopByRoadNameResult error = ', getBusStopByRoadNameResult.error);
  console.log('getBusStopByRoadNameResult data = ', getBusStopByRoadNameResult.data);

  console.log('getBusStopByDescriptionResult loading = ', getBusStopByDescriptionResult.loading);
  console.log('getBusStopByDescriptionResult error = ', getBusStopByDescriptionResult.error);
  console.log('getBusStopByDescriptionResult data = ', getBusStopByDescriptionResult.data);

  console.log('getBusStopByBusStopCodeResult loading = ', getBusStopByBusStopCodeResult.loading);
  console.log('getBusStopByBusStopCodeResult error = ', getBusStopByBusStopCodeResult.error);
  console.log('getBusStopByBusStopCodeResult data = ', getBusStopByBusStopCodeResult.data);

  console.log('getAllBusServiceResult loading = ', getAllBusServiceResult.loading);
  console.log('getAllBusServiceResult error = ', getAllBusServiceResult.error);
  console.log('getAllBusServiceResult data = ', getAllBusServiceResult.data);

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
      getBusStopByDescription({ variables: { description: placeName } });
    }
  }, [placeName]);

  useEffect(() => {
    if (busStopCode && busStopCode.length > 3) {
      getBusStopByBusStopCode({ variables: { busStopCode: busStopCode } });
    }
  }, [busStopCode]);

  useEffect(() => {
    if (busService) {
      getAllBusService({ variables: { busServiceNo: busService } });
    }
  }, [busService]);

  useEffect(() => {
    if (searchByBusServiceChecked) {
      getAllBusService({ variables: { busServiceNo: '' } });
    }
  }, [searchByBusServiceChecked]);

  useEffect(() => {
    if (getBusStopByRoadNameResult.data) {
      setRecordData(getBusStopByRoadNameResult.data);
    }
  }, [getBusStopByRoadNameResult.data]);

  useEffect(() => {
    if (getBusStopByDescriptionResult.data) {
      setRecord2Data(getBusStopByDescriptionResult.data);
    }
  }, [getBusStopByDescriptionResult.data]);

  useEffect(() => {
    if (getBusStopByBusStopCodeResult.data) {
      setRecord3Data(getBusStopByBusStopCodeResult.data);
    }
  }, [getBusStopByBusStopCodeResult.data]);

  useEffect(() => {
    if (getAllBusServiceResult.data) {
      setRecord4Data(getAllBusServiceResult.data);
    }
  }, [getAllBusServiceResult.data]);

  const getThemeData = async () => {
    const theme = await getAsyncStorageData('@theme');
    if (theme) {
      setTheme(theme);
    }
  };

  const handleRoadNameChange = (text: string) => {
    setRecordData(null);
    setRecord2Data(null);
    setRecord3Data(null);

    setRoadName(text);
  };

  const handlePlaceNameChange = (text: string) => {
    setRecordData(null);
    setRecord2Data(null);
    setRecord3Data(null);

    setPlaceName(text);
  };

  const handleBusStopCodeChange = (text: string) => {
    setRecordData(null);
    setRecord2Data(null);
    setRecord3Data(null);

    setBusStopCode(text);
  };

  const handleBusServiceChange = (text: string) => {
    setBusService(text);
  };

  const renderBusStopResultDiv = () => {
    let busStopResultDiv = (
      <View style={styles.noDataContainer}>
        <Text>There is no data</Text>
      </View>
    );

    if (getBusStopByRoadNameResult.loading) {
      busStopResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (getBusStopByRoadNameResult.error) {
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

    if (getBusStopByDescriptionResult.loading) {
      busStopResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (getBusStopByDescriptionResult.error) {
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

    if (getBusStopByBusStopCodeResult.loading) {
      busStopResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (getBusStopByBusStopCodeResult.error) {
        busStopResultDiv = (
          <View style={styles.errorContainer}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (record3Data) {
          if (record3Data.busStopByBusStopCode) {
            busStopResultDiv = record3Data.busStopByBusStopCode.map((item: any, i: number) => {
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

  const renderBusServicesResultDiv = () => {
    let busServiceResultDiv = (
      <View style={styles.noDataContainer}>
        <Text>There is no data</Text>
      </View>
    );

    if (getAllBusServiceResult.loading) {
      busServiceResultDiv = (
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      );
    } else {
      if (getAllBusServiceResult.error) {
        busServiceResultDiv = (
          <View style={styles.errorContainer}>
            <Text>There is error</Text>
          </View>
        );
      } else {
        if (record4Data) {
          busServiceResultDiv = record4Data.allBusService.map((item: any, i: number) => {
            return (
              <TouchableOpacity key={i} onPress={() => handleBusServiceClick(item.serviceNo)}>
                <View key={i} style={styles.busStopResultContainer}>
                  <Text style={styles.busServiceResultServiceNoText}>{item.serviceNo}</Text>
                </View>
              </TouchableOpacity>
            );
          });
        }
      }
    }

    return busServiceResultDiv;
  };

  const handleBusServiceClick = (busServiceNo: string) => {
    props.navigation.navigate(`BusServiceRoutes`, {
      busServiceNo: busServiceNo,
    });
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

    setSearchByRoadNamePlaceBusStopCodeChecked(false);
    setSearchByBusServiceChecked(false);

    setRoadName('');
    setPlaceName('');
    setBusStopCode('');
    setBusService('');

    setRecordData(null);
    setRecord2Data(null);
    setRecord3Data(null);

    if (
      !getBusStopByRoadNameResult.loading &&
      !getBusStopByDescriptionResult.loading &&
      !getBusStopByBusStopCodeResult.loading
    ) {
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

  const handleSearchByRoadNamePlaceBusStopCodeRadioButtonClick = () => {
    setSearchByRoadNamePlaceBusStopCodeChecked(true);
    setSearchByBusServiceChecked(false);
  };

  const handleSearchByBusServiceRadioButtonClick = () => {
    setSearchByRoadNamePlaceBusStopCodeChecked(false);
    setSearchByBusServiceChecked(true);
  };

  const renderResultView = () => {
    let resultView = null;

    if (searchByRoadNamePlaceBusStopCodeChecked) {
      resultView = (
        <View>
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
            placeholder="Road Name"
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
            placeholder="Bus Stop Code"
            placeholderTextColor="black"
            onChangeText={(text) => handleBusStopCodeChange(text)}
            value={busStopCode}
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
                <Button color="#1197d5" onPress={handleCancalButtonClick}>
                  Cancel
                </Button>
                <Button onPress={handleConfirmButtonClick}>Confirm</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      );
    } else if (searchByBusServiceChecked) {
      resultView = (
        <View>
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
            placeholder="Bus Service"
            placeholderTextColor="black"
            onChangeText={(text) => handleBusServiceChange(text)}
            value={busService}
          />

          <View style={{ marginVertical: 10 }}></View>

          {renderBusServicesResultDiv()}
        </View>
      );
    }

    return resultView;
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

        <View>
          <TouchableOpacity onPress={() => handleSearchByRoadNamePlaceBusStopCodeRadioButtonClick()}>
            <CustomRadioButton
              text={'Search By Road Name, Place, Bus Stop Code'}
              checked={searchByRoadNamePlaceBusStopCodeChecked}
              theme={theme}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSearchByBusServiceRadioButtonClick()}>
            <CustomRadioButton text={'Search By Bus Service'} checked={searchByBusServiceChecked} theme={theme} />
          </TouchableOpacity>
        </View>

        {renderResultView()}
      </View>
    </ScrollView>
  );
}

export default Search;

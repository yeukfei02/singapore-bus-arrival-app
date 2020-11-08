import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, ScrollView, View, RefreshControl, TouchableOpacity, Linking } from 'react-native';

import { gql, useLazyQuery } from '@apollo/client';

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

function Search(): JSX.Element {
  const [roadName, setRoadName] = useState('');
  const [placeName, setPlaceName] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const [recordData, setRecordData] = useState<any>(null);
  const [record2Data, setRecord2Data] = useState<any>(null);

  const [getBusStopByRoadName, record] = useLazyQuery(GET_BUS_STOP_BY_ROAD_NAME);
  const [getBusStopByDescrition, record2] = useLazyQuery(GET_BUS_STOP_BY_DESCRIPTION);

  console.log('record loading = ', record.loading);
  console.log('record error = ', record.error);
  console.log('record data = ', record.data);

  console.log('record2 loading = ', record2.loading);
  console.log('record2 error = ', record2.error);
  console.log('record2 data = ', record2.data);

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
                  <Text style={{ marginVertical: 5 }}>Bus Stop Code: {item.busStopCode}</Text>
                  <TouchableOpacity onPress={() => handleOpenInGoogleMap(item.latitude, item.longitude)}>
                    <Text style={{ color: 'blue', textDecorationLine: 'underline', marginVertical: 5 }}>
                      Open in google map
                    </Text>
                  </TouchableOpacity>
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
                  <Text style={{ marginVertical: 5 }}>Bus Stop Code: {item.busStopCode}</Text>
                  <TouchableOpacity onPress={() => handleOpenInGoogleMap(item.latitude, item.longitude)}>
                    <Text style={{ color: 'blue', textDecorationLine: 'underline', marginVertical: 5 }}>
                      Open in google map
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            });
          }
        }
      }
    }

    return busStopResultDiv;
  };

  const handleOpenInGoogleMap = (latitude: number, longitude: number) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setRoadName('');
    setPlaceName('');
    setRecordData(null);
    setRecord2Data(null);

    if (!record.loading && !record2.loading) {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.viewContainer}>
        <Text style={{ fontSize: 20 }}>Search</Text>

        <View style={{ marginVertical: 10 }}></View>

        <TextInput
          style={{
            height: 50,
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
            height: 50,
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
      </View>
    </ScrollView>
  );
}

export default Search;

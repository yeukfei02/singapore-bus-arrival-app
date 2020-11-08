import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { Button, Paragraph, Dialog } from 'react-native-paper';

import { storeDataToAsyncStorage, getAsyncStorageData } from '../../common/common';

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

function Settings(props: any): JSX.Element {
  const [theme, setTheme] = useState('light');

  const [changeThemeValue, setChangeThemeValue] = useState('');

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getThemeData();
    props.navigation.addListener('focus', () => {
      getThemeData();
    });
  }, []);

  const getThemeData = async () => {
    const theme = await getAsyncStorageData('@theme');
    if (theme) {
      setTheme(theme);
    }
  };

  const handleLightThemeClick = () => {
    setVisible(true);
    setChangeThemeValue('light');
  };

  const handleDarkThemeClick = () => {
    setVisible(true);
    setChangeThemeValue('dark');
  };

  const hideDialog = () => {
    setVisible(false);

    storeDataToAsyncStorage('@theme', changeThemeValue);
    props.navigation.navigate('NearMe');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme === 'light' ? 'white' : 'black' }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.viewContainer}>
        <Text style={{ fontSize: 20, color: theme === 'light' ? 'black' : 'white' }}>Settings</Text>

        <View style={{ marginVertical: 20 }}></View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <TouchableOpacity onPress={() => handleLightThemeClick()}>
            <View style={{ backgroundColor: 'tomato', padding: 15, borderRadius: 5 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>LIGHT THEME</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDarkThemeClick()}>
            <View style={{ backgroundColor: 'gray', padding: 15, borderRadius: 5 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>DARK THEME</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Dialog visible={visible}>
        <Dialog.Title>Change Theme</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            Confirm to change <Text style={{ fontWeight: 'bold' }}>{changeThemeValue}</Text> theme?
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog}>Confirm</Button>
        </Dialog.Actions>
      </Dialog>
    </ScrollView>
  );
}

export default Settings;

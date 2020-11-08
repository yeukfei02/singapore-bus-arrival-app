import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import MainView from './src/components/mainView/MainView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const client = new ApolloClient({
  uri: 'https://w34wh6x0kh.execute-api.ap-southeast-1.amazonaws.com/v1/',
  cache: new InMemoryCache(),
});

function App(): JSX.Element {
  return (
    <ApolloProvider client={client}>
      <View style={styles.container}>
        <MainView />
      </View>
    </ApolloProvider>
  );
}

export default App;

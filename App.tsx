import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import MainView from './src/components/mainView/MainView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'tomato',
    accent: 'gray',
  },
};

const client = new ApolloClient({
  uri: 'https://sxbyrgxzxe.execute-api.ap-southeast-1.amazonaws.com/prod/',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
  },
});

function App(): JSX.Element {
  return (
    <ApolloProvider client={client}>
      <PaperProvider theme={theme}>
        <View style={styles.container}>
          <MainView />
        </View>
      </PaperProvider>
    </ApolloProvider>
  );
}

export default App;

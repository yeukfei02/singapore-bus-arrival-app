import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PDFReader from 'rn-pdf-reader-js';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

function SingaporeMrtMapPdf(props: any): JSX.Element {
  const [uri, setUri] = useState('');

  useEffect(() => {
    if (props.route.params) {
      setUri(props.route.params.uri);
    }
  }, [props.route.params]);

  return (
    <View style={styles.container}>
      <PDFReader
        source={{
          uri: uri,
        }}
      />
    </View>
  );
}

export default SingaporeMrtMapPdf;

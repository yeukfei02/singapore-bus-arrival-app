import React from 'react';
import { Text, View } from 'react-native';

function CustomRadioButton(props: any): JSX.Element {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: props.theme === 'light' ? 'white' : 'black',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
      }}
    >
      <View
        style={[
          {
            height: 24,
            width: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: props.theme === 'light' ? 'black' : 'white',
            alignItems: 'center',
            justifyContent: 'center',
          },
          props.style,
        ]}
      >
        {props.checked ? (
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: props.theme === 'light' ? 'black' : 'white',
            }}
          />
        ) : null}
      </View>
      <Text
        style={{ fontSize: 14, fontWeight: 'bold', color: props.theme === 'light' ? 'black' : 'white', marginLeft: 8 }}
      >
        {props.text}
      </Text>
    </View>
  );
}

export default CustomRadioButton;

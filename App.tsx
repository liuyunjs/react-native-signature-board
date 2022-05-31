import * as React from 'react';
import { SafeAreaView, Text, Dimensions, View, Image } from 'react-native';
import 'react-native-portal-view';
import { SignatureBoard, SignatureBoardRef } from './library/main';

const { width } = Dimensions.get('window');

export default function () {
  const signatureRef = React.useRef<SignatureBoardRef>(null);
  const [fullScreen, setFullScreen] = React.useState(false);
  const [url, setUrl] = React.useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <SignatureBoard
          width={width}
          ref={signatureRef}
          fullScreen={fullScreen}>
          <Text
            onPress={async () => {
              console.log('signatureRef.current', signatureRef.current);
              const url = await signatureRef.current?.save();
              if (url) {
                setUrl(url);
              }
              setFullScreen(!fullScreen);
            }}
            style={{ fontSize: 30, position: 'absolute', top: 0, right: 0 }}>
            切换全屏
          </Text>
        </SignatureBoard>

        {!!url && (
          <Image
            style={{
              width,
              height: (width * 9) / 16,
            }}
            source={{ uri: url }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

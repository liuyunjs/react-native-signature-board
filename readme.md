# rn-signature-board
使用 react-native-reanimated、react-native-svg、react-native-gesture-handler、react-native-orientation-locker、react-native-view-shot实现的一款签名板；
1. 支持全屏
2. 支持保存图片

## install

### yarn
```shell
yarn add rn-signature-board react-native-reanimated react-native-svg react-native-gesture-handler react-native-orientation-locker react-native-view-shot
```

### npm
```shell
npm install --save rn-signature-board react-native-reanimated react-native-svg react-native-gesture-handler react-native-orientation-locker react-native-view-shot
```

## 示例
```typescript jsx
import * as React from 'react';
import { SafeAreaView, Text, Dimensions, View, Image } from 'react-native';
// 注意使用全屏必须导入
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

```

## Props
#### gestureRef?: React.Ref<PanGestureHandler>;
传递给 PanGestureHandler 的 ref prop
#### lineWidth?: number;
线条宽度，默认 1px
#### tintColor?: string;
线条颜色
#### dark_tintColor?: string;
暗黑模式下线条颜色
#### backgroundColor?: string;
背景颜色
#### dark_backgroundColor?: string;
暗黑模式下背景颜色
#### fullScreen?: boolean;
是否全屏
#### width?: number | string;
签名板宽度
#### ratio?: number;
签名板宽高比
#### captureWidth?: number;
保存的图片宽度，默认取 Dimensions.get('window').width
#### captureHeight?: number;
保存的图片高度，默认以 captureWidth 乘上宽高比
#### children?: React.ReactNode;
子组件，可以用来定义一些按钮，比如保存、重置之类的

##### *其余props参考 react-native-view-shot 的CaptureOptions，以及 react-native-gesture-handler 的 PanGestureHandler*

## Ref方法
#### reset: () => void;
清空画板
#### save: () => Promise<string>;
保存图片，返回图片url，可以通过 CaptureOptions 中的 result 参数设置为base64等方式返回

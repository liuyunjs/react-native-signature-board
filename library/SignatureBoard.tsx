import * as React from 'react';
import { StyleSheet, View, SafeAreaView, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { Svg, Path } from 'react-native-svg';
import {
  PanGestureHandler,
  PanGestureHandlerProps,
} from 'react-native-gesture-handler';
import { Portal } from 'react-native-portal-view';
import Orientation from 'react-native-orientation-locker';
import { darkly } from 'rn-darkly';
import { captureRef, CaptureOptions } from 'react-native-view-shot';
import { useContainerStyle } from './useContainerStyle';
import { useInitializer } from './useInitializer';
import { useGestureEvent } from './useGestureEvent';
import { useSignature } from './useSignature';

export type Context = ReturnType<typeof useInitializer>;

type SignatureBoardInternalProps = Omit<
  PanGestureHandlerProps,
  'onGestureEvent' | 'onHandlerStateChange'
> &
  Omit<CaptureOptions, 'width' | 'height'> & {
    gestureRef?: React.Ref<PanGestureHandler>;
    lineWidth?: number;
    tintColor?: string;
    captureWidth?: number;
    captureHeight?: number;
    backgroundColor?: string;
  };

export type SignatureBoardProps = SignatureBoardInternalProps & {
  fullScreen?: boolean;
  width?: number | string;
  ratio?: number;
  namespace?: string;
  children?: React.ReactNode;
};

export type SignatureBoardRef = {
  reset(): void;
  save(): Promise<string>;
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SignatureBoardInternal: React.FC<
  SignatureBoardInternalProps & { inputRef?: React.Ref<SignatureBoardRef> }
> = ({
  gestureRef,
  lineWidth,
  tintColor,
  children,
  format,
  path,
  captureHeight,
  captureWidth,
  quality,
  snapshotContentContainer,
  result,
  inputRef,
  backgroundColor,
  ...rest
}) => {
  const signatureRef = React.useRef<View>(null);

  const ctx = useInitializer();
  const onGestureEvent = useGestureEvent(ctx);

  const [paths, setPaths] = React.useState<string[]>([]);

  const points = useSignature(ctx, setPaths);

  React.useImperativeHandle(inputRef, () => ({
    reset() {
      setPaths([]);
      ctx.points.setValue('');
    },
    save(): Promise<string> {
      if (paths.length === 0) return Promise.resolve('');
      const options: CaptureOptions = {
        format,
        quality,
      };

      result != null && (options.result = result);
      path != null && (options.path = path);
      snapshotContentContainer != null &&
        (options.snapshotContentContainer = snapshotContentContainer);
      captureWidth != null && (options.width = captureWidth);
      captureHeight != null && (options.height = captureHeight);
      return captureRef(signatureRef, options);
    },
  }));

  return (
    <SafeAreaView style={[StyleSheet.absoluteFill, { backgroundColor }]}>
      <PanGestureHandler
        {...rest}
        ref={gestureRef}
        onHandlerStateChange={onGestureEvent}
        onGestureEvent={onGestureEvent}>
        <Animated.View style={styles.signature}>
          <Svg ref={signatureRef} height="100%" width="100%">
            {paths.map((path) => (
              <Path
                d={path}
                key={path}
                stroke={tintColor}
                fill="none"
                strokeWidth={lineWidth}
              />
            ))}
            <AnimatedPath
              d={points}
              fill="none"
              stroke={tintColor}
              strokeWidth={lineWidth}
            />
          </Svg>
          {children}
        </Animated.View>
      </PanGestureHandler>
    </SafeAreaView>
  );
};

const SignatureBoard = React.forwardRef<SignatureBoardRef, SignatureBoardProps>(
  function SignatureBoard(
    { fullScreen, width, ratio, namespace, ...rest },
    ref,
  ) {
    React.useLayoutEffect(() => {
      if (fullScreen) {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    }, [fullScreen]);

    if (!rest.captureHeight) {
      rest.captureHeight = rest.captureWidth! * ratio!;
    }

    const signatureBoard = <SignatureBoardInternal {...rest} inputRef={ref} />;

    return (
      <View style={useContainerStyle(width!, ratio!)}>
        {fullScreen ? (
          <Portal namespace={namespace}>{signatureBoard}</Portal>
        ) : (
          signatureBoard
        )}
      </View>
    );
  },
);

const DarklySignatureBoard = darkly(
  SignatureBoard,
  'tintColor',
  'backgroundColor',
);

DarklySignatureBoard.defaultProps = {
  activeOffsetX: 0,
  activeOffsetY: 0,
  ratio: 9 / 16,
  lineWidth: 1,
  width: '100%',
  backgroundColor: '#fff',
  dark_backgroundColor: '#000',
  tintColor: '#333',
  dark_tintColor: '#ccc',
  fullScreen: false,
  format: 'png',
  quality: 0.9,
  captureWidth: Dimensions.get('window').width,
};

export { DarklySignatureBoard as SignatureBoard };

const styles = StyleSheet.create({
  signature: {
    flex: 1,
  },
});

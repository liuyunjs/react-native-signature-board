import { event } from 'react-native-reanimated';
import { useWillMount } from '@liuyunjs/hooks/lib/useWillMount';
import type { Context } from './SignatureBoard';

export const useGestureEvent = (ctx: Context) =>
  useWillMount(() =>
    event([
      {
        nativeEvent: {
          x: ctx.x,
          y: ctx.y,
          state: ctx.gestureState,
        },
      },
    ]),
  );

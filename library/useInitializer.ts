import { State } from 'react-native-gesture-handler';
import { Value } from 'react-native-reanimated';
import { useWillMount } from '@liuyunjs/hooks/lib/useWillMount';

export const useInitializer = () =>
  useWillMount(() => {
    return {
      x: new Value<number>(0),
      y: new Value<number>(0),
      gestureState: new Value<State>(State.UNDETERMINED),
      points: new Value<string>(''),
    };
  });

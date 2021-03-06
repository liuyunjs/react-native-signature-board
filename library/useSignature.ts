import * as React from 'react';
import { useWillMount } from '@liuyunjs/hooks/lib/useWillMount';
import Animated, {
  proc,
  divide,
  sqrt,
  add,
  pow,
  sub,
  cond,
  multiply,
  eq,
  Value,
  set,
  concat,
  not,
  call,
} from 'react-native-reanimated';
import { State } from 'react-native-gesture-handler';
import type { Context } from './SignatureBoard';

// /**
//  * 获取控制点坐标
//  * @param  {Array} arr 4个点坐标数组
//  * @param  {Float} smooth_value [0, 1] 平滑度
//  *   p1 上一个点
//  *   p2 左端点
//  *   P3 右端点
//  *   p4 下一个点
//  * @return {Array}     2个点坐标数组
//  */
// getControlPoints: function(arr, smooth_value) {
//   var x0 = arr[0].x, y0 = arr[0].y;
//   var x1 = arr[1].x, y1 = arr[1].y;
//   var x2 = arr[2].x, y2 = arr[2].y;
//   var x3 = arr[3].x, y3 = arr[3].y;
//
//   // Assume we need to calculate the control
//   // points between (x1,y1) and (x2,y2).
//   // Then x0,y0 - the previous vertex,
//   //      x3,y3 - the next one.
//   // 1.假设控制点在(x1,y1)和(x2,y2)之间，第一个点和最后一个点分别是曲线路径上的上一个点和下一个点
//
//   // 2.求中点
//   var xc1 = (x0 + x1) / 2.0;
//   var yc1 = (y0 + y1) / 2.0;
//   var xc2 = (x1 + x2) / 2.0;
//   var yc2 = (y1 + y2) / 2.0;
//   var xc3 = (x2 + x3) / 2.0;
//   var yc3 = (y2 + y3) / 2.0;
//
//   // 3.求各中点连线长度
//   var len1 = Math.sqrt((x1-x0) * (x1-x0) + (y1-y0) * (y1-y0));
//   var len2 = Math.sqrt((x2-x1) * (x2-x1) + (y2-y1) * (y2-y1));
//   var len3 = Math.sqrt((x3-x2) * (x3-x2) + (y3-y2) * (y3-y2));
//
//   // 4.求中点连线长度比例（用来确定平移前p2, p3的位置）
//   var k1 = len1 / (len1 + len2);
//   var k2 = len2 / (len2 + len3);
//
//   // 5.平移p2
//   var xm1 = xc1 + (xc2 - xc1) * k1;
//   var ym1 = yc1 + (yc2 - yc1) * k1;
//
//   // 6.平移p3
//   var xm2 = xc2 + (xc3 - xc2) * k2;
//   var ym2 = yc2 + (yc3 - yc2) * k2;
//
//   // Resulting control points. Here smooth_value is mentioned
//   // above coefficient K whose value should be in range [0...1].
//   // 7.微调控制点与顶点之间的距离，越大曲线越平直
//   var ctrl1_x = xm1 + (xc2 - xm1) * smooth_value + x1 - xm1;
//   var ctrl1_y = ym1 + (yc2 - ym1) * smooth_value + y1 - ym1;
//
//   var ctrl2_x = xm2 + (xc2 - xm2) * smooth_value + x2 - xm2;
//   var ctrl2_y = ym2 + (yc2 - ym2) * smooth_value + y2 - ym2;
//
//   return [{x: ctrl1_x, y: ctrl1_y}, {x: ctrl2_x, y: ctrl2_y}];
// }

const center = proc(
  (x1: Animated.Adaptable<number>, x2: Animated.Adaptable<number>) =>
    divide(add(x2, x1), 2),
);

const length = proc(
  (
    x1: Animated.Adaptable<number>,
    x2: Animated.Adaptable<number>,
    y1: Animated.Adaptable<number>,
    y2: Animated.Adaptable<number>,
  ) => {
    return sqrt(add(pow(sub(x2, x1), 2), pow(sub(y2, y1), 2)));
  },
);

const k = proc(
  (
    a: Animated.Adaptable<number>,
    b: Animated.Adaptable<number>,
    c: Animated.Adaptable<number>,
  ) => {
    const total = add(b, c);
    return cond(total, divide(a, total));
  },
);

//   var ym1 = yc1 + (yc2 - yc1) * k1;
const m = proc(
  (
    c1: Animated.Adaptable<number>,
    c2: Animated.Adaptable<number>,
    k: Animated.Adaptable<number>,
  ) => {
    return add(multiply(sub(c2, c1), k), c1);
  },
);
//   var ctrl1_x = xm1 + (xc2 - xm1) * smooth_value + x1 - xm1;
const ctrl = proc(
  (
    m: Animated.Adaptable<number>,
    c: Animated.Adaptable<number>,
    p: Animated.Adaptable<number>,
    smooth: Animated.Adaptable<number>,
  ) => {
    return sub(add(add(m, multiply(smooth, sub(c, m))), p), m);
  },
);

export const useSignature = (
  ctx: Context,
  setPaths: React.Dispatch<React.SetStateAction<string[]>>,
): Animated.Node<string> =>
  useWillMount(() => {
    const p0x = new Value<number>(0);
    const p0y = new Value<number>(0);
    const p1x = new Value<number>(0);
    const p1y = new Value<number>(0);
    const p2x = new Value<number>(0);
    const p2y = new Value<number>(0);
    const isGesturing = new Value<number>(0);

    const xc1 = center(p1x, p0x);
    const yc1 = center(p1y, p0y);
    const xc2 = center(p2x, p1x);
    const yc2 = center(p2y, p1y);
    const xc3 = center(ctx.x, p2x);
    const yc3 = center(ctx.y, p2y);
    const len1 = length(p0x, p1x, p0y, p1y);
    const len2 = length(p1x, p2x, p1y, p2y);
    const len3 = length(p2x, ctx.x, p2y, ctx.y);
    const k1 = k(len1, len1, len2);
    const k2 = k(len2, len2, len3);
    const xm1 = m(xc1, xc2, k1);
    const ym1 = m(yc1, yc2, k1);
    const xm2 = m(xc2, xc3, k2);
    const ym2 = m(yc2, yc3, k2);
    const ctrlX1 = ctrl(xm1, xc2, p1x, 1);
    const ctrlY1 = ctrl(ym1, yc2, p1y, 1);
    const ctrlX2 = ctrl(xm2, xc2, p2x, 1);
    const ctrlY2 = ctrl(ym2, yc2, p2y, 1);

    return cond(
      eq(ctx.gestureState, State.ACTIVE),
      [
        cond(not(isGesturing), [
          set(isGesturing, 1),
          set(p0x, ctx.x),
          set(p0y, ctx.y),
          set(p1x, ctx.x),
          set(p1y, ctx.y),
          set(p2x, ctx.x),
          set(p2y, ctx.y),
          // @ts-ignore
          set(ctx.points, concat(ctx.points, 'M', ctx.x, ' ', ctx.y)),
        ]),
        set(p0x, p1x),
        set(p0y, p1y),
        set(p1x, p2x),
        set(p1y, p2y),
        set(p2x, ctx.x),
        set(p2y, ctx.y),

        //  @ts-ignore
        set(
          ctx.points,
          concat(
            ctx.points,
            'C',
            ctrlX1,
            ' ',
            ctrlY1,
            ' ',
            ctrlX2,
            ' ',
            ctrlY2,
            ' ',
            p2x,
            ' ',
            p2y,
          ),
        ),
      ],
      cond(
        isGesturing,
        [
          set(isGesturing, 0),
          // @ts-ignore
          call([ctx.points], (points: readonly string[]) => {
            setPaths((paths) => paths.concat(points));
          }),
          // @ts-ignore
          set(ctx.points, ''),
        ],
        ctx.points,
      ),
    );
  }) as any;

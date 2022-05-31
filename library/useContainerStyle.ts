import * as React from 'react';
import { isString } from '@liuyunjs/utils/lib/isString';

export const useContainerStyle = (width: number | string, radio: number) => {
  return React.useMemo(() => {
    let isPercent = false;
    if (isString(width)) {
      isPercent = width.endsWith('%');
      width = parseFloat(width);
    }

    return {
      width: isPercent ? `${width}%` : width,
      paddingTop: isPercent ? `${width * radio}%` : width * radio,
    };
  }, [width, radio]);
};

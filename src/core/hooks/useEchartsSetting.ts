import { getFunction } from '@/core/utils/jcode';

export function useEchartsSetting() {
  const getColor = (colorBegin, colorEnd) => {
    if (colorBegin && colorEnd) {
      // 设置渐变色
      return {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: colorBegin, // 0% 处的颜色
          },
          {
            offset: 1,
            color: colorEnd, // 100% 处的颜色
          },
        ],
      };
    } else if (colorBegin || colorEnd) {
      return colorBegin || colorEnd;
    }
  };

  const getLabelConfig = ({
    show,
    formatterType,
    formatterJS,
    formatter,
    color,
    position,
    fontWeight,
    fontSize,
  }) => {
    const label: Record<string, any> = {
      show,
      color,
      position,
      fontWeight,
      fontSize,
    };
    if (formatterType == 'fn') {
      const myEvent = getFunction(formatterJS);
      if (myEvent.res) {
        label.formatter = myEvent.fn;
      }
    } else if (formatter) {
      label.formatter = formatter.replace(/{e}/g, '\n');
    }

    return label;
  };

  const getXConfig = (
    {
      type,
      axisLineShow,
      axisLineColor,
      position,
      axisLabelFormatter,
      axisLabelColor,
      name,
      nameLocation,
      nameColor,
      nameFontWeight,
      nameFontSize,
    },
    isX: boolean,
  ) => {
    const axis: Record<string, any> = {
      type: type || 'category',
      axisLine: {
        show: axisLineShow,
        lineStyle: {
          color: axisLineColor,
        },
      },
      axisLabel: {},
      name,
      nameLocation,
      nameTextStyle: {
        color: nameColor, // 名称颜色
        fontWeight: nameFontWeight, // 名称字体粗线
        fontSize: nameFontSize, // 名称字体大小
      },
    };

    if (isX) {
      if (position == 0) {
        axis.position = 'left';
      } else if (position == 1) {
        axis.position = 'right';
      }
    } else {
      if (position == 0) {
        axis.position = 'bottom';
      } else if (position == 1) {
        axis.position = 'top';
      }
    }

    if (axisLabelFormatter) {
      axis.axisLabel.formatter = axisLabelFormatter;
    }
    if (axisLabelColor) {
      axis.axisLabel.color = axisLabelColor;
    }
    return axis;
  };
  const getYConfig = (settings, isX: boolean) => {
    const axisList: Record<string, any> = [];
    (settings || []).forEach(
      ({
        name, // 名称
        type,
        position, // 位置

        nameLocation, // 名称位置
        nameColor,
        nameFontWeight,
        nameFontSize,

        axisLineShow,
        axisLineColor,
        axisLabelFormatter,
        axisLabelColor,
        min,
        max,
        interval, // 坐标轴的分割段数
      }) => {
        const axis: Record<string, any> = {
          name,
          type,
          nameLocation: nameLocation || 'end',
          nameTextStyle: {
            color: nameColor, // 名称颜色
            fontWeight: nameFontWeight, // 名称字体粗线
            fontSize: nameFontSize, // 名称字体大小
          },
          axisLine: {
            show: axisLineShow,
            lineStyle: {
              color: axisLineColor,
            },
          },
          axisLabel: {},
        };
        if (axisLabelFormatter) {
          axis.axisLabel.formatter = axisLabelFormatter;
        }
        if (axisLabelColor) {
          axis.axisLabel.color = axisLabelColor;
        }

        if (min != undefined) {
          axis.min = min;
        }
        if (max) {
          axis.max = max;
        }

        if (interval) {
          axis.interval = interval;
        }

        if (isX) {
          if (position == 0) {
            axis.position = 'bottom';
          } else if (position == 1) {
            axis.position = 'top';
          }
        } else {
          if (position == 0) {
            axis.position = 'left';
          } else if (position == 1) {
            axis.position = 'right';
          }
        }

        axisList.push(axis);
      },
    );

    return axisList;
  };

  const getLegendConfig = ({
    show,
    orient,
    position,
    padding,
    widthAuto,
    width,
    itemWidth,
    itemHeight,
    textStyle,
    formatter,
  }) => {
    const legend: Record<string, any> = {
      show,
      orient,
      itemWidth,
      itemHeight,
      textStyle: {},
      formatter,
    };

    if (textStyle.color) {
      legend.textStyle.color = textStyle.color;
    }

    switch (position) {
      case 'topLeft':
        legend.left = 'left';
        legend.top = 'top';
        if (padding != undefined && padding != null) {
          legend.padding = [padding, 0, 0, padding];
        }
        break;
      case 'topRight':
        legend.left = 'right';
        legend.top = 'top';
        if (padding != undefined && padding != null) {
          legend.padding = [padding, padding, 0, 0];
        }
        break;
      case 'bottomLeft':
        legend.left = 'left';
        legend.top = 'bottom';
        if (padding != undefined && padding != null) {
          legend.padding = [0, 0, padding, padding];
        }
        break;
      case 'bottomRight':
        legend.left = 'right';
        legend.top = 'bottom';
        if (padding != undefined && padding != null) {
          legend.padding = [0, padding, padding, 0];
        }
        break;
      case 'topCenter':
        legend.left = 'center';
        legend.top = 'top';
        if (padding != undefined && padding != null) {
          legend.padding = [padding, 0, 0, 0];
        }
        break;
      case 'bottomCenter':
        legend.left = 'center';
        legend.top = 'bottom';
        if (padding != undefined && padding != null) {
          legend.padding = [0, 0, padding, 0];
        }
        break;
    }

    if (!widthAuto) {
      legend.width = width;
    }

    return legend;
  };

  const getToolTipConfig = ({ trigger, axisPointer }) => {
    const toolTip: Record<string, any> = {
      trigger: trigger || 'axis',
      axisPointer: {
        type: axisPointer.type,
      },
    };
    if (axisPointer.type == 'shadow') {
      toolTip.axisPointer.shadowStyle = {
        color: axisPointer.shadowStyle.color,
      };
    } else {
      toolTip.axisPointer.lineStyle = {
        color: axisPointer.lineStyle.color,
      };
    }

    return toolTip;
  };

  const getGridConfig = ({ left, right, top, bottom, containLabel }) => {
    const grid = {
      left: left + '%',
      right: right + '%',
      top,
      bottom,
      containLabel,
    };
    return grid;
  };

  const setBarConfig = (
    config,
    {
      color,
      colorEnd,
      hightLight,
      hightLightColor,
      hightLightColorEnd,
      barWidth,
      isStack,
      showLabel,
      colorLabel,
    },
  ) => {
    config.barWidth = barWidth;
    if (isStack) {
      config.stack = 'all';
    }
    config.label = config.label || {};
    config.label.show = showLabel;
    config.label.color = colorLabel;
    // config.label = { show: showLabel, color: colorLabel };
    config.itemStyle = {
      color: getColor(color, colorEnd),
    };

    if (hightLight) {
      config.emphasis = {
        disabled: false,
        itemStyle: {
          color: getColor(hightLightColor, hightLightColorEnd),
        },
      };
    }
  };

  const setLineConfig = (
    config,
    { lineSmooth, showLineSymbol, color, isArea, areaColor, areaColorEnd, isStack },
  ) => {
    config.smooth = lineSmooth;
    config.showSymbol = showLineSymbol;
    if (isArea) {
      config.areaStyle = {};
      config.areaStyle.color = getColor(areaColor || color, areaColorEnd);
    }

    if (isStack) {
      config.stack = 'all';
    }

    if (color) {
      config.itemStyle = {
        color: color,
      };
    }
  };

  const setPictorialBarConfig = (
    config,
    { color, colorEnd, hightLight, hightLightColor, hightLightColorEnd, barWidth },
  ) => {
    config.barWidth = barWidth;
    config.symbol = 'path://M0,10 L10,10 C5.5,10 5.5,5 5,0 C4.5,5 4.5,10 0,10 z';
    config.type = 'pictorialBar';

    config.itemStyle = {
      color: getColor(color, colorEnd),
    };

    if (hightLight) {
      config.emphasis = {
        disabled: false,
        itemStyle: {
          color: getColor(hightLightColor, hightLightColorEnd),
        },
      };
    }
  };

  const setPieConfig = (
    config,
    { radiusN, radiusW, centerH, centerV, roseType, selectedMode, selectedModeNum },
  ) => {
    if (radiusN < radiusW) {
      config.radius = [`${radiusN}%`, `${radiusW}%`]; // 设置圆心和外圆大小
    } else {
      config.radius = '50%';
    }

    if (selectedMode) {
      config.selectedMode = selectedMode;
      if (config.data.length > selectedModeNum) {
        config.data[selectedModeNum].selected = true;
      }
    }

    // 设置圆心位置
    config.center = [`${centerH}%`, `${centerV}%`];

    // 南丁格尔玫瑰
    if (roseType) {
      config.roseType = roseType;
    }
  };

  const setFunnelConfig = (
    serie,
    { min, max, minSize, maxSize, left, width, top, bottom, sort, gap },
  ) => {
    serie.min = min;
    serie.max = max;
    serie.minSize = minSize + '%';
    serie.maxSize = maxSize + '%';
    serie.left = left + '%';
    serie.top = top;
    serie.bottom = bottom;
    serie.width = width + '%';
    serie.sort = sort;
    serie.gap = gap;
  };

  return {
    getLabelConfig,
    getXConfig,
    getYConfig,
    getLegendConfig,
    getToolTipConfig,
    getGridConfig,
    setBarConfig,
    setLineConfig,
    setPictorialBarConfig,
    setPieConfig,
    setFunnelConfig,
  };
}

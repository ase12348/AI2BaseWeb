import dayjs from 'dayjs';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';

export function formatToDateTime(date?: dayjs.ConfigType, format = DATE_TIME_FORMAT): string {
  format = format.replace('yyyy-MM-dd', 'YYYY-MM-DD');

  return dayjs(date).format(format);
}

export function formatToDate(date?: dayjs.ConfigType, format = DATE_FORMAT): string {
  format = format.replace('yyyy-MM-dd', 'YYYY-MM-DD');
  return dayjs(date).format(format);
}

export const calcDate = (date1: string, date2: string) => {
  // 使用Day.js解析时间字符串
  const dt1 = dayjs(date1);
  const dt2 = dayjs(date2);

  // 计算两个时间的毫秒数差
  const diffInMilliseconds = dt2.diff(dt1);

  const days = Math.floor(diffInMilliseconds / (24 * 3600 * 1000));

  const leave1 = diffInMilliseconds % (24 * 3600 * 1000); // 计算天数后剩余的毫秒数
  const hours = Math.floor(leave1 / (3600 * 1000));

  const leave2 = leave1 % (3600 * 1000); // 计算小时数后剩余的毫秒数
  const minutes = Math.floor(leave2 / (60 * 1000));

  const leave3 = leave2 % (60 * 1000); // 计算分钟数后剩余的毫秒数
  const seconds = Math.round(leave3 / 1000);

  return {
    leave1,
    leave2,
    leave3,
    days,
    hours,
    minutes,
    seconds,
  };
};

export const calcDateHours = (date1: string, date2: string) => {
  // 使用Day.js解析时间字符串
  const dt1 = dayjs(date1);
  const dt2 = dayjs(date2);

  // 计算两个时间的毫秒数差
  const diffInMilliseconds = dt2.diff(dt1);
  const hours = Math.floor(diffInMilliseconds / (3600 * 1000));

  return hours;
};

export const calcDateText = (date1: string, date2: string) => {
  const { days, hours, minutes, seconds } = calcDate(date1, date2);

  let res = '';

  if (days > 0) {
    res += `${days}天`;
  }
  if (hours > 0) {
    res += `${hours}小时`;
  }
  if (minutes > 0) {
    res += `${minutes}分`;
  }
  if (seconds > 0) {
    res += `${seconds}秒`;
  }

  return res;
};

// 获取当前日期
export const getDayText = (dateParam: any) => {
  let date: any;
  if (dateParam instanceof Date) {
    date = dateParam;
  } else if (typeof dateParam === 'string') {
    date = new Date(dateParam);
    if (isNaN(date)) {
      throw new Error('Invalid date string');
    }
  } else if (dateParam === undefined) {
    date = new Date();
  } else {
    throw new TypeError('dateParam must be a Date object or a date string');
  }
  return '日一二三四五六'.charAt(date.getDay());
};

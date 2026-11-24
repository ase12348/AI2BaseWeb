import { toDecimal } from './method';

const fileIcon = {
  doc: 'file-word',
  docx: 'file-word',
  xls: 'file-excel',
  xlsx: 'file-excel',
  pdf: 'file-pdf',
  image: 'file-image',
  txt: 'file-txt',
  json: 'file-json',
} as Record<string, string>;

export const getFileEex = (fileName: string) => {
  if (fileName) {
    const nameList = fileName.split('.');
    return nameList[nameList.length - 1];
  }
  return '';
};

export const getFileIcon = (fileName: string, fileType: string) => {
  // 获取文件图标
  if (fileType && fileType.indexOf('image') > -1) {
    return 'file-image';
  }
  const fileEex = getFileEex(fileName);
  if (['webp', 'bmp', 'jpg', 'jpge', 'png', 'tif', 'gif', 'svg'].includes(fileEex)) {
    return 'file-image';
  }
  return fileIcon[fileEex] || 'file-ufo';
};

export const countFileSize = (size: number) => {
  if (size < 1024.0) {
    return toDecimal(size) + ' B';
  }

  if (size >= 1024.0 && size < 1048576) {
    return toDecimal(size / 1024.0) + ' KB';
  }

  if (size >= 1048576 && size < 1073741824) {
    return toDecimal(size / 1024.0 / 1024.0) + ' MB';
  }

  if (size >= 1073741824) {
    return toDecimal(size / 1024.0 / 1024.0 / 1024.0) + ' GB';
  }

  return '';
};

export const downFile = (url: string) => {
  const newwindow = window.open('_blank');
  if (newwindow) {
    newwindow.location = url;
  }
};

export const objFromArray = (arr?: any[], key = '_id'): Record<string, any> => {
  if (!arr || !arr.length) {
    return {};
  }
  return arr.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

export const objFromArray = (arr?: any[], key = 'id'): Record<string, any> => {
  if (!arr) {
    return {};
  }
  return arr.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

export const objFromArray = (arr: any[], key = 'id'): Record<string, any> => {
  return arr.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

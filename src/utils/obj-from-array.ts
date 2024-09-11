export const objFromArray = (arr: any[], key = 'id'): Record<string, any> => {
  console.log('arr', arr); // Log the array here

  return arr.reduce((acc, item) => {
    acc[item[key]] = item;
    return acc;
  }, {});
};

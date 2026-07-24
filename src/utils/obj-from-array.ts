export const objFromArray = (arr?: any[]): Record<string, any> => {
  if (!arr || !arr.length) {
    return {};
  }

  return arr.reduce((acc, item) => {
    const key = item.id;
    if (key) {
      acc[key] = item;
    }
    return acc;
  }, {} as Record<string, any>);
};

export const objFromArray = (arr?: any[]): Record<string, any> => {
  if (!arr || !arr.length) {
    return {};
  }

  return arr.reduce((acc, item) => {
    const key = item._id ?? item.id; // Use `_id` if available, otherwise use `id`.
    if (key) {
      acc[key] = item;
    }
    return acc;
  }, {} as Record<string, any>);
};

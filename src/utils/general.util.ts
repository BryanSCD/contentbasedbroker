/**
 * Return the object with the highest date field
 * @param objects Array of object with date fields
 * @param dateField Date field in object
 * @returns Object with highest date
 */
export const getObjectByHighestDate = <T>(
  objects: T[],
  dateField: string,
): T => {
  return objects.reduce((previousValue: T, currentValue: T) => {
    return new Date(previousValue[dateField]).getTime() -
      new Date(currentValue[dateField]).getTime()
      ? previousValue
      : currentValue;
  });
};

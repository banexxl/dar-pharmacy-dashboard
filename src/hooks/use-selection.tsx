import {
     useCallback,
     useState,
} from 'react';

export const useSelection = <T,>(
     items: T[] = []
) => {
     const [selected, setSelected] = useState<T[]>([]);

     const handleSelectAll = useCallback(() => {
          setSelected(items);
     }, [items]);

     const handleSelectOne = useCallback((item: T) => {
          setSelected((previousSelected) => {
               if (previousSelected.includes(item)) {
                    return previousSelected;
               }

               return [...previousSelected, item];
          });
     }, []);

     const handleDeselectAll = useCallback(() => {
          setSelected([]);
     }, []);

     const handleDeselectOne = useCallback((item: T) => {
          setSelected((previousSelected) =>
               previousSelected.filter(
                    (selectedItem) => selectedItem !== item
               )
          );
     }, []);

     return {
          deselectAll: handleDeselectAll,
          deselectOne: handleDeselectOne,
          selectAll: handleSelectAll,
          selectOne: handleSelectOne,
          selected,
     };
};
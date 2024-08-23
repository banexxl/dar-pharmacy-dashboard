import { useCallback, useState } from 'react';

export function useDialog() {
  const [state, setState] = useState({
    open: false,
    data: undefined,
  });

  const handleOpen = useCallback((data: any) => {
    setState({
      open: true,
      data,
    });
  }, []);

  const handleClose = useCallback(() => {
    setState({
      open: false,
      data: undefined,
    });
  }, []);

  return {
    data: state.data,
    handleClose,
    handleOpen,
    open: state.open,
  };
}

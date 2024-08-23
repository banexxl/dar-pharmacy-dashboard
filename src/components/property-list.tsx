import React from 'react';
import List from '@mui/material/List';

interface PropertyListProps {
  children?: React.ReactNode;
}

export const PropertyList: React.FC<PropertyListProps> = ({ children }) => {
  return <List disablePadding>{children}</List>;
};

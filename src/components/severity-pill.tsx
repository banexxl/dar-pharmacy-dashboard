import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

const SeverityPillRoot = styled('span')(({ theme, ownerState }: any) => {
     const colorKey = ownerState.color || 'primary'; // Default to 'primary' if color is undefined
     const color = theme.palette[colorKey];

     // Ensure the color object exists
     const backgroundColor = color ? color.alpha12 : alpha(theme.palette.primary.main, 0.12);
     const textColor = theme.palette.mode === 'dark' ? color?.main : color?.dark;

     return {
          alignItems: 'center',
          backgroundColor,
          borderRadius: 12,
          color: textColor,
          cursor: 'default',
          display: 'inline-flex',
          flexGrow: 0,
          flexShrink: 0,
          fontFamily: theme.typography.fontFamily,
          fontSize: theme.typography.pxToRem(12),
          lineHeight: 2,
          fontWeight: 600,
          justifyContent: 'center',
          letterSpacing: 0.5,
          minWidth: 20,
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
     };
});

export const SeverityPill = (props: any) => {
     const { color = 'primary', children, ...other } = props;

     const ownerState = { color };

     return (
          <SeverityPillRoot ownerState={ownerState} {...other}>
               {children}
          </SeverityPillRoot>
     );
};

SeverityPill.propTypes = {
     children: PropTypes.node,
     color: PropTypes.oneOf([
          'primary',
          'secondary',
          'error',
          'info',
          'warning',
          'success'
     ])
};

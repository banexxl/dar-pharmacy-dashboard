import Notify from "simple-notify";
import 'simple-notify/dist/simple-notify.css';

type NotifyPosition = 'left top' | 'top left' | 'right top' | 'top right' | 'left bottom' | 'bottom left' | 'right bottom' | 'bottom right' | 'center' | 'left y-center' | 'right y-center' | 'y-center left' | 'y-center right' | 'top x-center' | 'bottom x-center' | 'x-center top' | 'x-center bottom';

export const pushAlert = (
     status: 'error' | 'warning' | 'success' | 'info',
     title: string,
     text: string,
     effect: 'fade' | 'slide',
     speed: number,
     showIcon: boolean,
     showCloseButton: boolean,
     autoclose: boolean,
     autotimeout: number,
     type: 'outline' | 'filled',
     position: NotifyPosition
) => {
     new Notify({
          status: status,
          title: title,
          text: text,
          effect: effect,
          speed: speed,
          customClass: '',
          showIcon: showIcon,
          showCloseButton: showCloseButton,
          autoclose: autoclose,
          autotimeout: autotimeout,
          type: type,
          position: position,
     });
};

import Page from "@/pages/auth/login";
import { CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";


export const withAuthGuard = (Component: any) => (props: any) => {

  const { data: session, status } = useSession();

  //circular process in the middle screen
  if (status === "loading") {
    return <CircularProgress sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: '-20px',
      marginLeft: '-20px'
    }} />;
  }

  if (!session) {
    return <Page></Page>;
  }

  return (
    <Component {...props} />
  );
};

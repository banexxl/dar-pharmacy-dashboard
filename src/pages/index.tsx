import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OverviewBudget } from 'src/sections/overview/overview-budget';
import { OverviewLatestProducts } from 'src/sections/overview/overview-latest-products';
import { OverviewSales } from 'src/sections/overview/overview-sales';
import { OverviewTasksProgress } from 'src/sections/overview/overview-tasks-progress';
import { OverviewTotalCustomers } from 'src/sections/overview/overview-total-customers';
import { OverviewTotalProfit } from 'src/sections/overview/overview-total-profit';
import { OverviewTraffic } from 'src/sections/overview/overview-traffic';
import { SessionProvider } from 'next-auth/react';
import { OverviewLatestOrders } from '@/sections/overview/overview-latest-orders';
import { ordersServices } from '@/services/order-services';
import { userServices } from '@/services/user-services';
import { productsServices } from '@/services/product-services';

const now = new Date();

const calculatePercentageChange = (currentMonthSum: number, lastMonthSum: number): string => {
     if (lastMonthSum === 0) {
          return currentMonthSum > 0 ? '100' : '0'; // If last month's sum is 0, return infinity or 0
     }

     const percentageChange = ((currentMonthSum - lastMonthSum) / lastMonthSum) * 100;
     return `${percentageChange.toFixed(2)}%`; // Return percentage change formatted to 2 decimal places
};

const Page = (props: any) => {

     const percantageChange = calculatePercentageChange(props.sumForCurrentMonth, props.sumOfLastMonthOrders)
     console.log('props', props);


     return (
          <SessionProvider>
               <Head>
                    <title>
                         Overview
                    </title>
               </Head>
               <Box
                    component="main"
                    sx={{
                         flexGrow: 1,
                         py: 8
                    }}
               >
                    <Container maxWidth="xl">
                         <Grid
                              container
                              spacing={3}
                         >
                              <Grid
                                   xs={12}
                                   sm={6}
                                   lg={3}
                              >
                                   <OverviewBudget
                                        difference={percantageChange}
                                        positive
                                        sx={{ height: '100%' }}
                                        value={props.sumOfAllOrders}
                                        title="Bruto pazara"
                                        subTitle="U odnosu na prosli mesec"
                                   />
                              </Grid>
                              <Grid
                                   xs={12}
                                   sm={6}
                                   lg={3}
                              >
                                   <OverviewTotalCustomers
                                        difference={16}
                                        positive={false}
                                        sx={{ height: '100%' }}
                                        value="1.6k"
                                   />
                              </Grid>
                              <Grid
                                   xs={12}
                                   sm={6}
                                   lg={3}
                              >
                                   <OverviewTasksProgress
                                        sx={{ height: '100%' }}
                                        value={75.5}
                                   />
                              </Grid>
                              <Grid
                                   xs={12}
                                   sm={6}
                                   lg={3}
                              >
                                   <OverviewTotalProfit
                                        sx={{ height: '100%' }}
                                        value="$15k"
                                   />
                              </Grid>
                              <Grid
                                   xs={12}
                                   lg={8}
                              >
                                   <OverviewSales
                                        chartSeries={[
                                             {
                                                  name: 'This year',
                                                  data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20]
                                             },
                                             {
                                                  name: 'Last year',
                                                  data: [12, 11, 4, 6, 2, 9, 9, 10, 11, 12, 13, 13]
                                             }
                                        ]}
                                        sx={{ height: '100%' }}
                                   />
                              </Grid>
                              <Grid
                                   xs={12}
                                   md={6}
                                   lg={4}
                              >
                                   <OverviewTraffic
                                        chartSeries={[63, 15, 22]}
                                        labels={['Desktop', 'Tablet', 'Phone']}
                                        sx={{ height: '100%' }}
                                   />
                              </Grid>
                              <Grid
                                   xs={12}
                                   md={6}
                                   lg={4}
                              >
                                   <OverviewLatestProducts
                                        products={props.lastNProducts}
                                        sx={{ height: '100%' }}
                                   />
                              </Grid>
                              <Grid
                                   xs={12}
                                   md={12}
                                   lg={8}
                              >
                                   <OverviewLatestOrders
                                        orders={[
                                             {
                                                  id: 'f69f88012978187a6c12897f',
                                                  ref: 'DEV1049',
                                                  amount: 30.5,
                                                  customer: {
                                                       name: 'Ekaterina Tankova'
                                                  },
                                                  createdAt: 1555016400000,
                                                  status: 'pending'
                                             },
                                             {
                                                  id: '9eaa1c7dd4433f413c308ce2',
                                                  ref: 'DEV1048',
                                                  amount: 25.1,
                                                  customer: {
                                                       name: 'Cao Yu'
                                                  },
                                                  createdAt: 1555016400000,
                                                  status: 'delivered'
                                             },
                                             {
                                                  id: '01a5230c811bd04996ce7c13',
                                                  ref: 'DEV1047',
                                                  amount: 10.99,
                                                  customer: {
                                                       name: 'Alexa Richardson'
                                                  },
                                                  createdAt: 1554930000000,
                                                  status: 'refunded'
                                             },
                                             {
                                                  id: '1f4e1bd0a87cea23cdb83d18',
                                                  ref: 'DEV1046',
                                                  amount: 96.43,
                                                  customer: {
                                                       name: 'Anje Keizer'
                                                  },
                                                  createdAt: 1554757200000,
                                                  status: 'pending'
                                             },
                                             {
                                                  id: '9f974f239d29ede969367103',
                                                  ref: 'DEV1045',
                                                  amount: 32.54,
                                                  customer: {
                                                       name: 'Clarke Gillebert'
                                                  },
                                                  createdAt: 1554670800000,
                                                  status: 'delivered'
                                             },
                                             {
                                                  id: 'ffc83c1560ec2f66a1c05596',
                                                  ref: 'DEV1044',
                                                  amount: 16.76,
                                                  customer: {
                                                       name: 'Adam Denisov'
                                                  },
                                                  createdAt: 1554670800000,
                                                  status: 'delivered'
                                             }
                                        ]}
                                        sx={{ height: '100%' }}
                                   />
                              </Grid>
                         </Grid>
                    </Container>
               </Box>
          </SessionProvider>
     )
}

Page.getLayout = (page: any) => (
     <DashboardLayout>
          {page}
     </DashboardLayout>
);

export default Page;

export async function getServerSideProps(context: any) {

     const allClients = await userServices().getAllUsers()
     const sumOfAllOrders = await ordersServices().getSumOfAllOrders()
     const sumOfLastMonthsOrders = await ordersServices().getSumOfLastMonthsOrders(1)
     const sumOfLastMonthOrders = await ordersServices().getSumOfLastMonthOrders()
     const sumForCurrentMonth = await ordersServices().getSumOfCurrentMonthOrders()
     const lastNProducts = await productsServices().getLastNumberOfProducts(5)

     return {
          props: {
               allClients: JSON.parse(JSON.stringify(allClients)),
               sumOfAllOrders: JSON.parse(JSON.stringify(sumOfAllOrders)),
               sumOfLastMonthsOrders: JSON.parse(JSON.stringify(sumOfLastMonthsOrders)),
               sumOfLastMonthOrders: JSON.parse(JSON.stringify(sumOfLastMonthOrders)),
               sumForCurrentMonth: JSON.parse(JSON.stringify(sumForCurrentMonth)),
               lastNProducts: JSON.parse(JSON.stringify(lastNProducts)),
          },
     };
}

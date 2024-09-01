import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import { Box, Container, Unstable_Grid2 as Grid } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OverviewBudget } from 'src/sections/overview/overview-budget';
import { OverviewLatestProducts } from 'src/sections/overview/overview-latest-products';
import { OverviewTasksProgress } from 'src/sections/overview/overview-tasks-progress';
import { OverviewTotalCustomers } from 'src/sections/overview/overview-total-customers';
import { OverviewSales } from '@/sections/overview/overview-sales';
import { OverviewTotalProfit } from 'src/sections/overview/overview-total-profit';
import { OverviewTraffic } from 'src/sections/overview/overview-traffic';
import { SessionProvider } from 'next-auth/react';
import { OverviewLatestOrders } from '@/sections/overview/overview-latest-orders';
import { ordersServices } from '@/services/order-services';
import { userServices } from '@/services/user-services';
import { productsServices } from '@/services/product-services';

const calculatePercentageChange = (currentMonthSum: number, lastMonthSum: number): string => {
     if (lastMonthSum === 0) {
          return currentMonthSum > 0 ? '100' : '0'; // If last month's sum is 0, return infinity or 0
     }

     const percentageChange = ((currentMonthSum - lastMonthSum) / lastMonthSum) * 100;
     return `${percentageChange.toFixed(2)}%`; // Return percentage change formatted to 2 decimal places
};

const Page = (props: any) => {
     console.log(props.sumOfLastMonthOrders);

     const percantageChange = calculatePercentageChange(props.sumForCurrentMonth, props.sumOfLastMonthOrders)

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
                                        value={props.sumForCurrentMonth}
                                        title="Tekući mesec"
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
                                                  name: 'Ova godina',
                                                  data: props.monthlySumForCurrentYear.map((month: any) => month.total)
                                             },
                                             {
                                                  name: 'Prošla godina',
                                                  data: props.monthlySumForLastYear.map((month: any) => month.total)
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
                                        orders={props.lastNOrders}
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
     const lastNOrders = await ordersServices().getLastNumberOfOrders(6)
     const monthlySumForCurrentYear = await ordersServices().getMonthlyOrderSumsForYear(0)
     const monthlySumForLastYear = await ordersServices().getMonthlyOrderSumsForYear(-1)

     return {
          props: {
               allClients: JSON.parse(JSON.stringify(allClients)),
               sumOfAllOrders: JSON.parse(JSON.stringify(sumOfAllOrders)),
               sumOfLastMonthsOrders: JSON.parse(JSON.stringify(sumOfLastMonthsOrders)),
               sumOfLastMonthOrders: JSON.parse(JSON.stringify(sumOfLastMonthOrders)),
               sumForCurrentMonth: JSON.parse(JSON.stringify(sumForCurrentMonth)),
               lastNProducts: JSON.parse(JSON.stringify(lastNProducts)),
               lastNOrders: JSON.parse(JSON.stringify(lastNOrders)),
               monthlySumForCurrentYear: JSON.parse(JSON.stringify(monthlySumForCurrentYear)),
               monthlySumForLastYear: JSON.parse(JSON.stringify(monthlySumForLastYear)),
          },
     };
}

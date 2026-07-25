'use client';

import { Box, Container, Grid } from '@mui/material';
import { OverviewBudget } from 'src/sections/overview/overview-budget';
import { OverviewLatestProducts } from 'src/sections/overview/overview-latest-products';
import { OverviewTotalCustomers } from 'src/sections/overview/overview-total-customers';
import { OverviewSales } from '@/sections/overview/overview-sales';
import { OverviewTotalProfit } from 'src/sections/overview/overview-total-profit';
import { OverviewTraffic } from 'src/sections/overview/overview-traffic';
import { OverviewLatestOrders } from '@/sections/overview/overview-latest-orders';
import { AuthProvider } from '@/context/auth-context';

const calculatePercentageChange = (currentMonthSum: number, lastMonthSum: number): string => {
     if (lastMonthSum === 0) {
          return currentMonthSum > 0 ? '100' : '0'; // If last month's sum is 0, return infinity or 0
     }

     const percentageChange = ((currentMonthSum - lastMonthSum) / lastMonthSum) * 100;
     return `${percentageChange.toFixed(2)}`; // Return percentage change formatted to 2 decimal places
};

const Page = (props: any) => {

     const percantageChange = calculatePercentageChange(props.sumForCurrentMonth, props.sumOfLastMonthOrders)

     return (
          <AuthProvider>
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
                                   size={{ xs: 12, sm: 6, lg: 3 }}
                              >
                                   <OverviewBudget
                                        difference={percantageChange}
                                        positive={props.sumForCurrentMonth > props.sumOfLastMonthOrders}
                                        sx={{ height: '100%' }}
                                        value={props.sumForCurrentMonth}
                                        title="Tekući mesec"
                                        subTitle="U odnosu na prosli mesec"
                                   />
                              </Grid>
                              <Grid
                                   size={{ xs: 12, sm: 6, lg: 3 }}
                              >
                                   <OverviewTotalCustomers
                                        difference={
                                             (props.usersActiveLastWeek.length === 0 || (props.usersActiveThisWeek.length - props.usersActiveLastWeek.length) <= 0)
                                                  ? 0
                                                  : ((props.usersActiveThisWeek.length - props.usersActiveLastWeek.length) / props.usersActiveLastWeek.length) * 100

                                        }
                                        positive={props.usersActiveThisWeek.length > props.usersActiveLastWeek.length}
                                        sx={{ height: '100%' }}
                                        value={props.usersActiveThisWeek.length}
                                   />
                              </Grid>
                              <Grid
                                   size={{ xs: 12, sm: 6, lg: 3 }}
                              >
                                   <OverviewTotalProfit
                                        sx={{ height: '100%' }}
                                        value="$15k"
                                   />
                              </Grid>
                              <Grid
                                   size={{ xs: 12, md: 6, lg: 4 }}
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
                                   size={{ xs: 12, md: 6, lg: 4 }}
                              >
                                   <OverviewTraffic
                                        chartSeries={[63, 15, 22]}
                                        labels={['Desktop', 'Tablet', 'Phone']}
                                        sx={{ height: '100%' }}
                                   />
                              </Grid>
                              <Grid
                                   size={{ xs: 12, lg: 4 }}
                              >
                                   <OverviewLatestProducts
                                        products={props.lastNProducts}
                                        sx={{ height: '100%' }}
                                   />
                              </Grid>
                              <Grid
                                   size={{ xs: 12, lg: 8 }}
                              >
                                   <OverviewLatestOrders
                                        orders={props.lastNOrders}
                                        sx={{ height: '100%' }}
                                   />
                              </Grid>
                         </Grid>
                    </Container>
               </Box>
          </AuthProvider>
     )
}


export default Page;

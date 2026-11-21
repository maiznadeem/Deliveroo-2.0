// React Navigation 7 no longer navigates into nested navigators by bare screen name, and `navigate`
// no longer pops back to a screen that is already in the stack. The app's structure is:
//   Root stack -> DashboardDrawer (drawer) -> DashboardTab (bottom tabs) -> Dashboard | AllStoresScreen | BasketScreen | ProfileScreen
//                                          -> ProfileScreen | BasketScreen (drawer-level duplicates)

// From a root-stack screen (Restaurant, Delivery): go back to the existing DashboardDrawer and show a tab.
export function popToDashboardTab(navigation, tabScreen = 'Dashboard') {
  navigation.popTo('DashboardDrawer', {
    screen: 'DashboardTab',
    params: { screen: tabScreen },
  });
}

// From a screen inside DashboardDrawer (tab or drawer level): switch to a tab of the dashboard.
export function navigateToDashboardTab(navigation, tabScreen = 'Dashboard') {
  navigation.navigate('DashboardTab', { screen: tabScreen });
}

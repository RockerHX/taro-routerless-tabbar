import { getTabKeys } from 'taro-routerless-tabbar'

import homeIcon from '../../assets/tabbar/home.svg'
import homeActiveIcon from '../../assets/tabbar/home-active.svg'
import ordersIcon from '../../assets/tabbar/orders.svg'
import ordersActiveIcon from '../../assets/tabbar/orders-active.svg'
import profileIcon from '../../assets/tabbar/profile.svg'
import profileActiveIcon from '../../assets/tabbar/profile-active.svg'

export const tabItems = [
  {
    key: 'home',
    text: '首页',
    iconPath: homeIcon,
    selectedIconPath: homeActiveIcon,
  },
  {
    key: 'orders',
    text: '订单',
    iconPath: ordersIcon,
    selectedIconPath: ordersActiveIcon,
  },
  {
    key: 'profile',
    text: '我的',
    iconPath: profileIcon,
    selectedIconPath: profileActiveIcon,
  },
] as const

export type TabKey = (typeof tabItems)[number]['key']

export const tabKeys = getTabKeys(tabItems)

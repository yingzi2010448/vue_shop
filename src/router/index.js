import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Login.vue')
const Home = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Home.vue')
const Welcome = () => import(/* webpackChunkName: "login-home-welcome" */ '../components/Welcome.vue')
const Users = () => import(/* webpackChunkName: "users" */ '../components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "rights" */ '../components/rights/Rights.vue')
const Roles = () => import(/* webpackChunkName: "rights" */ '../components/rights/Roles.vue')
const Cate = () => import(/* webpackChunkName: "goods" */ '../components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "goods" */ '../components/goods/Params.vue')
const List = () => import(/* webpackChunkName: "goods" */ '../components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "goods" */ '../components/goods/Add.vue')
const Order = () => import(/* webpackChunkName: "order-report" */ '../components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "order-report" */ '../components/report/Report.vue')
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import Users from '../components/user/Users.vue'
// import Rights from '../components/rights/Rights.vue'
// import Roles from '../components/rights/Roles.vue'
// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
// import List from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
// to将要访问的路径
// from 代表从哪个路径跳转而来
// next 是一个函数表示放行,next('/login')强制跳转
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router

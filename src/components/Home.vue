<template>
    <el-container class="home-container">
      <!-- 头部区域 -->
     <el-header>
       <div>
         <img src="../assets/timg.jpg" alt="logo" class="logo-img" />
         <span>电子商城后台管理系统</span>
       </div>
       <el-button type="info" @click="logout">退出</el-button>
     </el-header>
      <!-- 内容主体区域 -->
     <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 收缩按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu  background-color="#333744" text-color="#fff" :collapse-transition="false"
        active-text-color="#409EFF" :unique-opened="true" router
        :collapse="isCollapse" :default-active="$route.path">
        <!-- unique-opened:是否只保持一个子菜单的展开 默认为false -->
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" :key="item.id" v-for="item in menulist">
          <!-- 这里的index只接受字符串不接受数值，但item.id为数值，让其拼接一个字符串就为字符串了 -->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" :key="subItem.id" v-for="subItem in item.children">
              <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
     </el-container>
   </el-container>
</template>

<script>
export default {
  data () {
    return {
      menulist: [],
      iconsObj: {
        125: 'el-icon-s-custom',
        103: 'el-icon-folder',
        101: 'el-icon-shopping-cart-2',
        102: 'el-icon-document',
        145: 'el-icon-data-line'
      },
      isCollapse: false
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    // 退出
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(res)
    },
    // 侧边栏菜单折叠
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  }

}
</script>

<style lang="less" scoped>
.home-container{
  height: 100%;
}
.el-header{
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0px;
  align-items: center;
  > div{
    display: flex;
    align-items: center;
     span{
       margin-left: 15px;
       color: #fff;
     }
  }
}
.el-aside{
  background-color: #333744;
  .el-menu{
    border: none;
  }
}
.el-main{
  background-color: #eaedf1;
}
.logo-img{
  width: 64px;
  height: 60px;
}
.toggle-button{
  background-color:#4a5064;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}

</style>

<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 登录logo -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" class="login-form" label-width="0px">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <el-form-item class="login-btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetloginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则对象
      loginRules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 5, max: 8, message: '长度在 5 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮重置登录信息
    resetloginForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // 预校验validate方法
        if (!valid) return
        // 因为在main.js入口文件中定义了Vue.prototype.$http=axios,所以this.$http等价于axios
        const { data: res } = await this.$http.post('login', this.loginForm)// 结构赋值res
        if (res.meta.status !== 200) return this.$message.error('登录失败')// $message在element.js中挂载为vue原型上的属性
        this.$message.success('登录成功')
        // 1.将登录成功之后的token，保存到客户端的sessionStorage中
        //   项目中除了登录以外的其他API接口，必须在登录之后才可以生效
        //   token直应在当前网站打开期间生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        // 2.通过编程式导航跳转到后台管理主页，路由地址为'/home'
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang = 'less' scoped>
.login-container {
  background-color: #2b4b6b;
  height: 100%;
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar-box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.login-btns {
  display: flex;
  justify-content: flex-end;
}
.login-form {
  position: absolute;
  bottom: 0;
  box-sizing: border-box;
  width: 100%;
  padding: 0 20px;
}
</style>

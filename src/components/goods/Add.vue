<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品添加</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

            <!-- 步骤导航条 -->
            <el-steps :active="activeStep - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px" label-position="top">
                <!-- 左侧进度条 -->
                <el-tabs v-model="activeStep"  :tab-position="'left'"
                         :before-leave="beforeTableLeave" @tab-click="tabChange">
                    <!-- 基本信息 -->
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model.number="addForm.goods_price"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model.number="addForm.goods_weight"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model.number="addForm.goods_number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="catList" :props="cascaderProps" @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 商品参数many -->
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item v-for=" item in manyTableData" :key="item.attr_id" :label="item.attr_name">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="item2" v-for="(item2 , i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 商品属性only -->
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item v-for="item in onlyTableData" :key="item.attr_id" :label="item.attr_name">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload :action="uploadURL" :on-preview="handlePreview"
                        :on-remove="handleRemove" list-type="picture" :headers="reqHeader" :on-success="uploadSuccess">
                        <el-button size="small" type="primary">上传图片</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                         <!-- 富文本编辑器 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button type="primary" class="addCat" @click="addCat">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>

            <el-dialog title="图片预览" :visible.sync="picDialogVisible" width="50%">
              <img :src="previewPath" alt width="100%" />
            </el-dialog>

        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      activeStep: '0',
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pic: [],
        goods_introduce: '',
        attrs: []
      },
      addFormrules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: blur }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: blur },
          { type: 'number', message: '请输入数字' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: blur },
          { type: 'number', message: '请输入数字' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: blur },
          { type: 'number', message: '请输入数字' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      catList: [],
      selectedKeys: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数数据
      manyTableData: [],
      // 静态属性参数
      onlyTableData: [],
      uploadURL: 'http://timemeetyou.com:8889/api/private/v1/upload',
      // 为上传图片添加请求头
      reqHeader: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      picDialogVisible: false
    }
  },
  created () {
    this.getCatList()
  },
  computed: {
    // 被选中的参数id，即为三级id
    catId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    async getCatList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类参数失败')
      this.catList = res.data
    },
    handleChange () {
    },
    beforeTableLeave (activeStep, oldActiveStep) {
      if (oldActiveStep === '0' && !this.addForm.goods_cat.length) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabChange () {
      // 商品参数tab
      if (this.activeStep === '1') {
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`,
          { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error('获取动态参数失败!')
        console.log(res)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
        })
        this.manyTableData = res.data
        // 静态属性tab
      } else if (this.activeStep === '2') {
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`,
          { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error('获取静态属性失败!')
        console.log(res)
        this.onlyTableData = res.data
      }
    },
    // 图片预览
    handlePreview (file) {
      console.log(file)
      this.previewPath = file.response.data.url // 服务器路径
      this.picDialogVisible = true
    },
    // 删除图片
    handleRemove (file) {
      // console.log(file)
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },
    // 将图片上传到服务器
    uploadSuccess (response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pic.push(picInfo) // 临时路径
      console.log(this.addForm.pic)
    },
    // 点击按钮上传商品信息
    addCat () {
      // 首先表单检验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请补全商品信息！')
        // 深拷贝addform，处理商品分类
        const form = JSON.parse(JSON.stringify(this.addForm))
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)

        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
        console.log(res)

        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
  }

}
</script>

<style lang="less" scoped>
.el-tabs{
    overflow: hidden;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.addCat{
  margin-top: 15px;
}
</style>

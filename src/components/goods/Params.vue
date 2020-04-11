<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 警告提示框 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>
            <!-- 选择父级分类 -->
            <el-row class="row-tp">
                <el-col>
                    选择商品分类：
                    <el-cascader v-model="selectedKeys" :options="CatList" :props="cascaderProps" @change="CatChanged"
                        clearable  collapse-tags>
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- 参数设置区域 -->
            <el-row>
                <el-col>
                    <el-tabs v-model="activeName" @tab-click="tabChange">
                        <!-- 动态参数区域 -->
                        <el-tab-pane label="动态参数" name="many">
                            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加参数</el-button>
                            <el-table :data="manyTableData" border stripe>
                                <el-table-column type="expand">
                                  <template v-slot="scope">
                                      <el-tag v-for="(item, i) in scope.row.attr_vals" :key="item.id" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                                      <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                                        size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                      </el-input>
                                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                  </template>
                                </el-table-column>
                                <el-table-column type="index"></el-table-column>
                                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                                <el-table-column label="操作">
                                    <template v-slot="scope">
                                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
                                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                        <!-- 静态属性区域 -->
                        <el-tab-pane label="静态属性" name="only">
                            <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加属性</el-button>
                            <el-table :data="onlyTableData" border stripe>
                                <el-table-column type="expand">
                                    <template v-slot="scope">
                                      <el-tag v-for="(item, i) in scope.row.attr_vals" :key="item.id" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                                      <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput"
                                        size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                      </el-input>
                                      <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                                  </template>
                                </el-table-column>
                                <el-table-column type="index"></el-table-column>
                                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                                <el-table-column label="操作">
                                    <template v-slot="scope">
                                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
                                        <el-button size="mini" type="danger" icon="el-icon-delete"  @click="removeParams(scope.row.attr_id)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
            </el-row>

        </el-card>

        <!-- 添加dialog -->
        <el-dialog :title="activeName==='many' ? '添加动态参数' : '添加静态属性'"  :visible.sync="addParamsDialogVisible" width="50%" @close="addParamsDialogClosed">
            <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef">
                <el-form-item :label="activeName==='many' ? '动态参数：' : '静态属性：'" prop="attr_name">
                    <el-input v-model="addParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

         <!-- 编辑dialog -->
        <el-dialog :title="activeName==='many' ? '编辑动态参数' : '编辑静态属性'"  :visible.sync="editParamsDialogVisible" width="50%" @close="editParamsDialogClosed">
            <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef">
                <el-form-item :label="activeName==='many' ? '动态参数：' : '静态属性：'" prop="attr_name">
                    <el-input v-model="editParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      selectedKeys: [],
      CatList: [],
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 当前激活的tab
      activeName: 'many',
      // 动态参数
      manyTableData: [],
      // 静态属性
      onlyTableData: [],
      // 添加属性功能数据
      addParamsDialogVisible: false,
      addParamsForm: {
        attr_name: ''
      },
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入属性名称', trigger: 'blur' }
        ]
      },
      // 编辑属性功能数据
      editParamsDialogVisible: false,
      editParamsForm: {
        attr_name: '',
        attr_id: ''
      },
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入属性名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCatList()
  },
  methods: {
    async getCatList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      this.CatList = res.data
    },
    // 商品分类改变
    async CatChanged () {
      this.getCatParams()
    },
    // tab属性分类改变
    tabChange () {
      this.getCatParams()
      console.log(this.activeName)
    },
    async getCatParams () {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
      }
      console.log(this.selectedKeys)
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error('获取商品参数失败！')

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      // 判断获取的是动态参数还是静态属性
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    showAddParamsDialog () {
      this.addParamsDialogVisible = true
    },
    addParamsDialogClosed () {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 添加参数
    addParams () {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.catId}/attributes`,
          { attr_name: this.addParamsForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功！')

        this.getCatParams()
        this.addParamsDialogVisible = false
      })
    },
    // 显示编辑参数dialog并拿到当前所要修改的商品
    showEditDialog (cat) {
      this.editParamsForm.attr_name = cat.attr_name
      this.editParamsForm.attr_id = cat.attr_id
      this.editParamsDialogVisible = true
    },
    // 关闭编辑参数dialog并重置表单数据
    editParamsDialogClosed () {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 编辑参数
    editParams () {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.catId}/attributes/${this.editParamsForm.attr_id}`,
          { attr_name: this.editParamsForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
        this.$message.success('修改参数成功！')

        this.getCatParams()
        this.editParamsDialogVisible = false
      })
    },
    // 根据attr_id删除属性
    async removeParams (pid) {
      const confirmTag = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmTag !== 'confirm') return this.$message('取消删除该参数')
      const { data: res } = await this.$http.delete(`categories/${this.catId}/attributes/${pid}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')

      this.getCatParams()
    },
    async handleInputConfirm (row) {
      // 判断输入的值是否有效
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 添加有效的值
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.savaParams(row)
    },
    // 封装修改params函数
    async savaParams (row) {
      const { data: res } = await this.$http.put(`categories/${this.catId}/attributes/${row.attr_id}`,
        { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
      if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
      this.$message.success('修改参数成功！')
    },
    showInput (the) {
      the.inputVisible = true

      // 当页面上元素被重新渲染之后，才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数
    handleClose (i, row) {
      row.attr_vals.splice(i, 1)
      this.savaParams(row)
    }
  },
  computed: {
    // 只有当选择三级分类时添加按钮才可以使用
    isBtnDisabled () {
      if (this.selectedKeys.length === 3) return false
      else return true
    },
    catId () {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.row-tp{
    margin-top: 15px;
}
.el-tag{
  margin-right:15px ;
  margin-bottom:10px ;
}
.input-new-tag{
  width: 120px;
}
</style>

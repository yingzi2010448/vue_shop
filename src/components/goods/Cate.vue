<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row>
                <el-col><el-button type="primary" @click="showAddCatDialog">添加分类</el-button></el-col>
            </el-row>

            <!-- 树形表格 -->
            <tree-table style= "margin-top:15px" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text="#" border>
                <template v-slot:isOk="scope">
                   <i class="el-icon-error" v-if="scope.row.cat_deleted === 'flase'" style="color:red"></i>
                   <i class="el-icon-success" v-else  style="color:lightgreen"></i>
                </template>
                <template v-slot:order="scope">
                   <el-tag v-if="scope.row.cat_level == '0'">一级</el-tag>
                   <el-tag v-if="scope.row.cat_level == '1'" type="success">二级</el-tag>
                   <el-tag v-if="scope.row.cat_level == '2'" type="danger">三级</el-tag>
                </template>
                <template slot="option">
                   <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                   <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页列表 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]"
            :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

            <!-- 添加分类区域 -->
            <el-dialog title="添加分类" :visible.sync="addCatDialogVisible" width="50%" @close="addCatDialogClosed" >
                <el-form :model="addCatForm" :rules="addCatrules" ref="addCatRef" label-width="100px">
                    <el-form-item label="分类名称:" prop="cat_name">
                        <el-input v-model="addCatForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类:">
                        <!-- option用来指定数据源 -->
                        <el-cascader v-model="selectedKeys" :options="parentCatList" :props="cascaderProps" @change="parentCatChanged"
                        clearable  collapse-tags>
                        </el-cascader>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addCatDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCat">确 定</el-button>
                </span>
            </el-dialog>

        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      catelist: [],
      // 树形表格自定义clomns
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOk'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      addCatDialogVisible: false,
      addCatForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类规则
      addCatrules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      parentCatList: [],
      // 被选择的分类
      selectedKeys: [],
      // 次联选择器属性
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
      //   console.log(res)
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 分页列表页数改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 分页列表每页显示数量改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类dialog
    showAddCatDialog () {
      this.getparentCatList()
      this.addCatDialogVisible = true
    },
    // 获取父级分类
    async getparentCatList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取父级分类失败！')
      this.parentCatList = res.data
    },
    // 添加父级分类
    parentCatChanged () {
      console.log(this.selectedKeys)
      // 如果this.selectedKeys.length>0证明选择的是父级分类
      if (this.selectedKeys.length > 0) {
        this.addCatForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCatForm.cat_level = this.selectedKeys.length
        // eslint-disable-next-line no-useless-return
        return
      } else {
        this.addCatForm.cat_pid = 0
        this.addCatForm.cat_level = 0
      }
    },
    // 添加分类并触发表单预校验
    addCat () {
      this.$refs.addCatRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCatForm)
        if (res.meta.status !== 201) this.$message.error('添加分类失败！')
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCatDialogVisible = false
      })
    },
    // 添加分类dialog关闭后初始化数据
    addCatDialogClosed () {
      this.$refs.addCatRef.resetFields()
      this.selectedKeys = []
      this.addCatForm.cat_level = 0
      this.addCatForm.cat_pid = 0
    }
  }

}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>

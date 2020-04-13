<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input  placeholder="请输入内容"  class="input-with-select" v-model="queryInfo.query"
                    clearable @clear="getGoodsList">
                    <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button></el-input>
                </el-col>
                <el-col :span="6">
                    <el-button type="primary" @click="goAddGoods">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- table表格区域 -->
            <el-table :data="goodslist" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="170px">
                <template slot-scope="scope">
                    {{scope.row.add_time | dateFormat}}
                </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                <template v-slot="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.goods_id)"></el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.goods_id)"></el-button>
                </template>
                </el-table-column>
            </el-table>

            <!-- 编辑用户区域 -->
            <el-dialog title="编辑商品信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
                <el-form :model="editForm" :rules="editFormrules" ref="editFormRef" label-width="90px">
                    <el-form-item label="商品名称:" prop="goods_name">
                        <el-input v-model="editForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格:" prop="goods_price">
                        <el-input v-model.number="editForm.goods_price"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量:" prop="goods_weight">
                        <el-input v-model.number="editForm.goods_weight"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editGoods">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      editDialogVisible: false,
      goodslist: [],
      total: 0,
      editForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_id: '',
        attrs: [],
        pics: [],
        goods_introduce: ''
      },
      editFormrules: {
        goods_name: [
          { required: true, message: '请输入商品信息', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
          { type: 'number', message: '请输入数字' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { type: 'number', message: '请输入数字' }
        ]
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败！')
      console.log(res.data)
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 根据id删除商品
    async removeById (id) {
      const confirmTag = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmTag !== 'confirm') return this.$message('已取消删除该商品')
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除该商品失败！')
      this.$message.success('删除该商品成功！')
      this.getGoodsList()
    },
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('goods/' + id)
      if (res.meta.status !== 200) return this.$message.error('获取商品信息失败')
      // this.$message.success('获取商品信息成功')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editGoods () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('goods/' + this.editForm.goods_id, this.editForm)
        console.log(res)
        if (res.meta.status !== 200) return this.$message('修改商品信息失败')
        this.$message.success('修改商品信息成功')
        this.editDialogVisible = false
        this.getGoodsList()
      })
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    goAddGoods () {
      this.$router.push({ path: 'goods/add' })
    }
  }

}
</script>

<style lang="less" scoped>
</style>

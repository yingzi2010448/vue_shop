<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input  placeholder="请输入内容"  class="input-with-select" v-model="queryInfo.query"
                    clearable @clear="getOrdersList">
                    <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
                    </el-input>
                </el-col>
            </el-row>

             <!-- 订单信息 -->
            <el-table :data="ordersList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status" width="80px">
                    <template v-slot="scope">
                        <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="warning" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
                <el-table-column label="下单时间" prop="create_time" width="170px">
                    <template v-slot="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="130px">
                    <template >
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddressDiglog" ></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProressDialog" ></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 修改地址dialog -->
            <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" @close="addressDialogClosed">
                <el-form :model="addressForm" :rules="addressFormFormrules" ref="addressFormRef" label-width="90px">
                    <el-form-item label="省市区/县" prop="goods_name">
                        <el-cascader v-model="addressForm.Province" :options="cityData" :props="{ expandTrigger: 'hover' }">
                        </el-cascader>
                    </el-form-item>
                    <el-form-item label="详细地址:" prop="goods_price">
                        <el-input v-model.number="addressForm.Home"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addressDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="updateAdress">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 修改地址dialog -->
            <el-dialog title="物流信息" :visible.sync="progressDialogVisible" width="50%">
                <el-timeline>
                    <el-timeline-item v-for="(item, index) in progressInfo" :key="index" :timestamp="item.time">
                    {{item.context}}
                    </el-timeline-item>
                </el-timeline>
            </el-dialog>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      ordersList: [],
      addressDialogVisible: false,
      cityData,
      addressForm: {
        Province: [],
        Home: ''
      },
      addressFormFormrules: {
        Province: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        Home: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      progressDialogVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })

      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      console.log(res)
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    showAddressDiglog () {
      this.addressDialogVisible = true
    },
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    updateAdress () {
    },
    async showProressDialog () {
      const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流进度失败！')
      }
      this.progressInfo = res.data

      this.progressDialogVisible = true
      console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader{
    width: 100%;
}
</style>

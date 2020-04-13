<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <!-- 1为 ECharts 准备一个具备大小（宽高）的 DOM -->
            <div id="main" style="width: 700px;height:400px;"></div>
        </el-card>

    </div>
</template>

<script>
import _ from 'lodash'
import echarts from 'echarts'
export default {
  data () {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {},
  async mounted () {
    // 2基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message.error('获取折线图数据失败！')
    // 3指定图表的配置项和数据
    const data = _.merge(res.data, this.options)
    // 4使用刚指定的配置项和数据显示图表。
    myChart.setOption(data)
  }

}
</script>

<style lang="less" scoped>

</style>

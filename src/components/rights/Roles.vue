<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表 -->
            <el-table :data="roleslist" border scripe>
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'', 'flexcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <!-- 一级权限 -->
                            <el-col :span="5">
                                <el-tag >{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二、三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[i2 === 0 ? '':'bdtop', 'flexcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="danger" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="item3 in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="角色操作" width="300px">
                    <template v-slot="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting" @click="showRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      roleslist: [],
      setRightDialogVisible: false,
      rightslist: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 初始化角色默认选取的节点
      defKeys: [],
      roleId: ''
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(' 请求角色列表失败！')
      console.log(res)
      this.roleslist = res.data
    },
    // 通过角色id删除对应权限id
    async removeRightById (role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.error('已取消删除该权限！')
      const { data: res } = await this.$http.delete(`/roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除该权限失败！')
      this.$message.success('删除该权限成功！')

      // 重新获取该角色嵌套的权限数据
      role.children = res.data
    },
    // 展示并获取角色已有的权限列表
    async showRightDialog (role) {
      // 将当前所操作的角色id绑定到data中以便增删改查时定位
      this.roleId = role.id
      const { data: res } = await this.$http.get('/rights/tree')
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取权限数据失败！')
      this.$message.success('获取权限数据成功！')
      this.rightslist = res.data

      this.getLeafKeys(role, this.defKeys)
      console.log(this.defKeys)
      this.setRightDialogVisible = true
    },
    // 获取该角色下所有三级权限的id，并保存到 defKeys 数组中
    getLeafKeys (node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 提交选择的权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配角色权限失败！')
      this.$message.success('分配角色权限成功！')

      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.bdtop {
  border-top: 1px solid #eee;
}
.flexcenter {
  display: flex;
  align-items: center;
}
</style>

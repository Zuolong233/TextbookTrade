const { ref, onMounted, computed } = Vue;
const { ElMessage } = ElementPlus;

export default {
    name: 'CourseTree',
    emits: ['course-select'],
    setup(props, { emit }) {
        const coursesData = ref({});
        const loading = ref(false);
        const expandedKeys = ref([]);
        const API_BASE = 'http://localhost:5000/api';

        const loadCoursesTree = async () => {
            loading.value = true;
            try {
                const response = await axios.get(`${API_BASE}/courses/tree`);
                coursesData.value = response.data;
            } catch (error) {
                console.error('加载课程失败:', error);
                ElMessage.error('加载课程数据失败，请检查后端服务');
            } finally {
                loading.value = false;
            }
        };

        const treeData = computed(() => {
            const result = [];
            let nodeId = 1;

            for (const [major, semesters] of Object.entries(coursesData.value)) {
                const majorNode = {
                    id: nodeId++,
                    label: `🎓 ${major}`,
                    children: []
                };

                for (const [semester, courses] of Object.entries(semesters)) {
                    const semesterNode = {
                        id: nodeId++,
                        label: `📅 ${semester}`,
                        children: courses.map(course => ({
                            id: nodeId++,
                            label: `📖 ${course.name} (${course.code})`,
                            courseData: course,
                            isLeaf: true
                        }))
                    };
                    majorNode.children.push(semesterNode);
                }
                result.push(majorNode);
            }
            return result;
        });

        const handleNodeClick = (data) => {
            if (data.courseData) {
                emit('course-select', data.courseData);
                ElMessage.success(`已选择课程：${data.courseData.name}`);
            }
        };

        const expandAll = () => {
            const getAllIds = (nodes) => {
                let ids = [];
                nodes.forEach(node => {
                    ids.push(node.id);
                    if (node.children) {
                        ids = ids.concat(getAllIds(node.children));
                    }
                });
                return ids;
            };
            expandedKeys.value = getAllIds(treeData.value);
        };

        onMounted(() => {
            loadCoursesTree();
        });

        return {
            coursesData,
            treeData,
            loading,
            expandedKeys,
            handleNodeClick,
            expandAll,
            loadCoursesTree
        };
    },
    template: `
        <div class="course-tree-container">
            <div class="tree-header">
                <el-button @click="loadCoursesTree" :loading="loading" size="small">
                    🔄 刷新数据
                </el-button>
                <el-button @click="expandAll" size="small" type="primary">
                    📂 展开所有
                </el-button>
            </div>

            <div v-loading="loading" class="tree-content">
                <el-tree
                    :data="treeData"
                    :expanded-keys="expandedKeys"
                    :props="{ children: 'children', label: 'label' }"
                    node-key="id"
                    @node-click="handleNodeClick"
                    class="course-tree"
                    :expand-on-click-node="false"
                    :check-on-click-node="false">
                    <template #default="{ node, data }">
                        <div class="tree-node">
                            <span class="node-label">{{ node.label }}</span>
                            <span v-if="data.courseData" class="course-badge">课程</span>
                        </div>
                    </template>
                </el-tree>

                <div v-if="Object.keys(coursesData).length === 0 && !loading" class="empty-state">
                    <p>📚 暂无课程数据</p>
                    <el-button @click="loadCoursesTree" type="primary">重新加载</el-button>
                </div>
            </div>
        </div>
    `,
    style: `
        .course-tree-container {
            width: 100%;
        }
        
        .tree-header {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            justify-content: flex-start;
        }
        
        .tree-content {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            min-height: 400px;
        }
        
        .course-tree {
            background: transparent;
        }
        
        .tree-node {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding-right: 20px;
        }
        
        .node-label {
            font-size: 14px;
            color: #2c3e50;
        }
        
        .course-badge {
            background: #409eff;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        
        .empty-state p {
            font-size: 18px;
            margin-bottom: 20px;
        }
        
        .el-tree-node__content:hover {
            background-color: #f0f9ff !important;
        }
        
        .el-tree-node__content {
            height: 40px;
            border-radius: 8px;
            margin-bottom: 4px;
        }
    `
};
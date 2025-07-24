const { ref, onMounted, watch } = Vue;
const { ElMessage } = ElementPlus;

export default {
    name: 'TextbookList',
    props: {
        course: {
            type: Object,
            default: null
        }
    },
    emits: ['view-listings'],
    setup(props, { emit }) {
        const textbooks = ref([]);
        const loading = ref(false);
        const API_BASE = 'http://localhost:5000/api';

        const loadTextbooks = async () => {
            if (!props.course) return;
            
            loading.value = true;
            try {
                const mockTextbooks = [
                    {
                        id: 1,
                        isbn: '9787111234567',
                        title: '高等数学教材',
                        author: '张三',
                        publisher: '清华大学出版社',
                        course_id: props.course.id
                    },
                    {
                        id: 2,
                        isbn: '9787111234568',
                        title: '数据结构与算法',
                        author: '王五',
                        publisher: '人民邮电出版社',
                        course_id: props.course.id
                    }
                ];
                
                await new Promise(resolve => setTimeout(resolve, 800));
                textbooks.value = mockTextbooks;
            } catch (error) {
                console.error('加载教材失败:', error);
                ElMessage.error('加载教材数据失败');
            } finally {
                loading.value = false;
            }
        };

        const viewListings = (textbook) => {
            ElMessage.success(`正在查看《${textbook.title}》的二手书信息`);
            emit('view-listings', textbook);
        };

        watch(() => props.course, () => {
            if (props.course) {
                loadTextbooks();
            }
        }, { immediate: true });

        return {
            textbooks,
            loading,
            viewListings,
            loadTextbooks
        };
    },
    template: `
        <div class="textbook-list-container">
            <div v-if="!course" class="no-course">
                <p>📚 请先选择一个课程</p>
            </div>

            <div v-else>
                <div class="course-info">
                    <h3>📖 {{ course.name }} ({{ course.code }})</h3>
                    <p>以下是该课程的相关教材</p>
                </div>

                <div v-loading="loading" class="textbooks-grid">
                    <div 
                        v-for="textbook in textbooks" 
                        :key="textbook.id"
                        class="textbook-card">
                        <el-card shadow="hover" class="book-card">
                            <div class="book-content">
                                <div class="book-header">
                                    <h4 class="book-title">📚 {{ textbook.title }}</h4>
                                </div>
                                
                                <div class="book-details">
                                    <div class="detail-row">
                                        <span class="label">✍️ 作者:</span>
                                        <span>{{ textbook.author }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">🏢 出版社:</span>
                                        <span>{{ textbook.publisher }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="label">🔢 ISBN:</span>
                                        <span class="isbn-code">{{ textbook.isbn }}</span>
                                    </div>
                                </div>

                                <div class="book-actions">
                                    <el-button 
                                        @click="viewListings(textbook)"
                                        type="primary"
                                        size="default"
                                        class="action-btn">
                                        🛒 查看二手书
                                    </el-button>
                                    <el-button 
                                        size="default"
                                        plain
                                        class="action-btn">
                                        📋 教材详情
                                    </el-button>
                                </div>
                            </div>
                        </el-card>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-if="textbooks.length === 0 && !loading" class="empty-state">
                    <div class="empty-content">
                        <p class="empty-icon">📚</p>
                        <h3>暂无教材信息</h3>
                        <p>该课程暂未录入教材信息</p>
                        <el-button @click="loadTextbooks" type="primary">重新加载</el-button>
                    </div>
                </div>
            </div>
        </div>
    `,
    style: `
        .textbook-list-container {
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .no-course {
            text-align: center;
            padding: 60px 20px;
            color: #999;
            font-size: 18px;
        }
        
        .course-info {
            margin-bottom: 25px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
        }
        
        .course-info h3 {
            margin: 0 0 10px 0;
            font-size: 22px;
        }
        
        .course-info p {
            margin: 0;
            opacity: 0.9;
        }
        
        .textbooks-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 20px;
        }
        
        .textbook-card {
            height: 100%;
        }
        
        .book-card {
            height: 100%;
        }
        
        .book-content {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .book-header {
            margin-bottom: 15px;
        }
        
        .book-title {
            margin: 0;
            color: #2c3e50;
            font-size: 18px;
            line-height: 1.4;
        }
        
        .book-details {
            flex: 1;
            margin-bottom: 20px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 10px;
            align-items: center;
        }
        
        .label {
            min-width: 80px;
            color: #666;
            font-size: 14px;
        }
        
        .isbn-code {
            font-family: monospace;
            background: #f1f3f4;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
        }
        
        .book-actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .action-btn {
            flex: 1;
            min-width: 120px;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #999;
        }
        
        .empty-content .empty-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .empty-content h3 {
            margin: 0 0 10px 0;
            color: #666;
        }
        
        .empty-content p {
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            .textbooks-grid {
                grid-template-columns: 1fr;
            }
            
            .book-actions {
                flex-direction: column;
            }
            
            .action-btn {
                width: 100%;
            }
        }
    `
};
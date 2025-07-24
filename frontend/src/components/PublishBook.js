const { reactive, ref } = Vue;
const { ElMessage } = ElementPlus;

export default {
    name: 'PublishBook',
    setup() {
        const form = reactive({
            textbook_id: '',
            title: '',
            author: '',
            isbn: '',
            publisher: '',
            seller_id: 1, 
            price: '',
            condition: '8成新',
            description: '',
            contact_method: 'wechat',
            contact_info: ''
        });

        const loading = ref(false);
        const API_BASE = 'http://localhost:5000/api';

        const conditionOptions = [
            { label: '全新', value: '全新' },
            { label: '9成新', value: '9成新' },
            { label: '8成新', value: '8成新' },
            { label: '7成新', value: '7成新' },
            { label: '6成新', value: '6成新' },
            { label: '5成新', value: '5成新' }
        ];

        const contactOptions = [
            { label: '微信', value: 'wechat' },
            { label: 'QQ', value: 'qq' },
            { label: '手机号', value: 'phone' },
            { label: '邮箱', value: 'email' }
        ];

        const publishBook = async () => {
            if (!form.title.trim()) {
                ElMessage.warning('请输入教材名称');
                return;
            }
            if (!form.price || form.price <= 0) {
                ElMessage.warning('请输入有效价格');
                return;
            }
            if (!form.contact_info.trim()) {
                ElMessage.warning('请输入联系方式');
                return;
            }

            loading.value = true;
            try {
                const response = await axios.post(`${API_BASE}/publish`, {
                    title: form.title,
                    author: form.author,
                    isbn: form.isbn,
                    publisher: form.publisher,
                    price: parseFloat(form.price),
                    condition: form.condition,
                    description: form.description,
                    contact_method: form.contact_method,
                    contact_info: form.contact_info,
                    seller_name: '当前用户', 
                    seller_id: form.seller_id
                });
                
                if (response.data.success) {
                    ElMessage.success('📚 教材发布成功！已在二手市场展示');
                    resetForm();
                  
                    window.dispatchEvent(new CustomEvent('refreshMarketplace'));
                    
             
                    setTimeout(() => {
                        ElMessage.info('您可以切换到"二手市场"页面查看刚发布的教材');
                    }, 1500);
                } else {
                    ElMessage.error(response.data.message || '发布失败');
                }
            } catch (error) {
                console.error('发布失败:', error);
                ElMessage.error('发布失败，请检查网络连接');
            } finally {
                loading.value = false;
            }
        };

        const resetForm = () => {
            Object.keys(form).forEach(key => {
                if (key === 'condition') {
                    form[key] = '8成新';
                } else if (key === 'contact_method') {
                    form[key] = 'wechat';
                } else if (key === 'seller_id') {
                    form[key] = 1;
                } else {
                    form[key] = '';
                }
            });
        };

        const autoFillFromISBN = async () => {
            if (!form.isbn.trim()) {
                ElMessage.warning('请先输入ISBN号');
                return;
            }

            try {
                const response = await axios.post(`${API_BASE}/search_book_by_isbn`, {
                    isbn: form.isbn
                });
                
                if (response.data) {
                    form.title = response.data.title;
                    form.author = response.data.author;
                    form.publisher = response.data.publisher;
                    ElMessage.success('📚 已自动填充教材信息');
                }
            } catch (error) {
                ElMessage.error('获取教材信息失败');
            }
        };

        return {
            form,
            loading,
            conditionOptions,
            contactOptions,
            publishBook,
            resetForm,
            autoFillFromISBN
        };
    },
    template: `
        <div class="publish-book-container">
            <div class="publish-form">
                <el-form 
                    :model="form" 
                    label-width="100px" 
                    size="default"
                    class="book-form">

                    <!-- 教材基本信息 -->
                    <div class="form-section">
                        <h3>📚 教材基本信息</h3>
                        
                        <el-form-item label="📖 教材名称" required>
                            <el-input 
                                v-model="form.title"
                                placeholder="请输入教材名称，如：高等数学"
                                clearable />
                        </el-form-item>

                        <el-form-item label="🔢 ISBN号">
                            <div class="isbn-input-group">
                                <el-input 
                                    v-model="form.isbn"
                                    placeholder="如：9787111234567"
                                    clearable 
                                    class="isbn-input" />
                                <el-button 
                                    @click="autoFillFromISBN"
                                    type="primary"
                                    size="default">
                                    🔍 自动填充
                                </el-button>
                            </div>
                        </el-form-item>

                        <el-form-item label="✍️ 作者">
                            <el-input 
                                v-model="form.author"
                                placeholder="请输入作者姓名"
                                clearable />
                        </el-form-item>

                        <el-form-item label="🏢 出版社">
                            <el-input 
                                v-model="form.publisher"
                                placeholder="请输入出版社名称"
                                clearable />
                        </el-form-item>
                    </div>

                    <!-- 交易信息 -->
                    <div class="form-section">
                        <h3>💰 交易信息</h3>
                        
                        <el-form-item label="💵 售价" required>
                            <el-input 
                                v-model="form.price"
                                type="number"
                                placeholder="请输入价格"
                                min="0"
                                step="0.01">
                                <template #suffix>元</template>
                            </el-input>
                        </el-form-item>

                        <el-form-item label="📊 成色" required>
                            <el-select v-model="form.condition" placeholder="请选择成色">
                                <el-option
                                    v-for="option in conditionOptions"
                                    :key="option.value"
                                    :label="option.label"
                                    :value="option.value">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="📝 教材描述">
                            <el-input 
                                v-model="form.description"
                                type="textarea"
                                :rows="4"
                                placeholder="请描述教材的具体情况，如：使用程度、是否有笔记、缺页等"
                                maxlength="500"
                                show-word-limit />
                        </el-form-item>
                    </div>

                    <!-- 联系信息 -->
                    <div class="form-section">
                        <h3>📞 联系信息</h3>
                        
                        <el-form-item label="📱 联系方式" required>
                            <el-select v-model="form.contact_method" placeholder="选择联系方式">
                                <el-option
                                    v-for="option in contactOptions"
                                    :key="option.value"
                                    :label="option.label"
                                    :value="option.value">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="📋 联系账号" required>
                            <el-input 
                                v-model="form.contact_info"
                                :placeholder="getContactPlaceholder()"
                                clearable />
                        </el-form-item>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="form-actions">
                        <el-button 
                            @click="publishBook"
                            type="primary"
                            size="large"
                            :loading="loading"
                            class="publish-btn">
                            <span v-if="!loading">🚀 发布到二手市场</span>
                            <span v-else>发布中...</span>
                        </el-button>
                        <el-button 
                            @click="resetForm"
                            size="large"
                            class="reset-btn">
                            🗑️ 重置表单
                        </el-button>
                    </div>
                </el-form>
            </div>

            <!-- 发布提示 -->
            <div class="publish-tips">
                <el-alert
                    title="📝 发布须知"
                    type="info"
                    :closable="false"
                    show-icon>
                    <div class="tips-content">
                        <p>• 📚 请确保教材信息准确，便于买家查找</p>
                        <p>• 💰 建议参考市场价格合理定价</p>
                        <p>• 📊 如实描述教材成色和使用情况</p>
                        <p>• 📞 提供真实有效的联系方式</p>
                        <p>• 🏫 建议在校园安全场所进行交易</p>
                    </div>
                </el-alert>
            </div>
        </div>
    `,
    methods: {
        getContactPlaceholder() {
            const placeholders = {
                'wechat': '请输入微信号',
                'qq': '请输入QQ号',
                'phone': '请输入手机号',
                'email': '请输入邮箱地址'
            };
            return placeholders[this.form.contact_method] || '请输入联系方式';
        }
    },
    style: `
        .publish-book-container {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .publish-form {
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            margin-bottom: 25px;
        }
        
        .form-section {
            margin-bottom: 30px;
            padding-bottom: 25px;
            border-bottom: 1px solid #eee;
        }
        
        .form-section:last-of-type {
            border-bottom: none;
            margin-bottom: 20px;
        }
        
        .form-section h3 {
            margin: 0 0 20px 0;
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            padding-left: 10px;
            border-left: 4px solid #409eff;
        }
        
        .isbn-input-group {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .isbn-input {
            flex: 1;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        .publish-btn {
            min-width: 180px;
            font-weight: 600;
        }
        
        .reset-btn {
            min-width: 120px;
        }
        
        .publish-tips {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }
        
        .tips-content p {
            margin: 8px 0;
            line-height: 1.6;
            color: #666;
        }
        
        .el-form-item {
            margin-bottom: 20px;
        }
        
        .el-input {
            font-size: 14px;
        }
        
        .el-textarea {
            font-size: 14px;
        }
        
        @media (max-width: 768px) {
            .publish-form {
                padding: 20px;
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .publish-btn,
            .reset-btn {
                width: 100%;
            }
            
            .isbn-input-group {
                flex-direction: column;
            }
            
            .isbn-input {
                width: 100%;
            }
        }
    `
};
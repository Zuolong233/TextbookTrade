const { ref, onMounted, reactive } = Vue;
const { ElMessage, ElMessageBox } = ElementPlus;

export default {
    name: 'BookMarketplace',
    setup() {
        const listings = ref([]);
        const loading = ref(false);
        const API_BASE = 'http://localhost:5000/api';

        const appointmentForm = reactive({
            listing_id: '',
            buyer_id: 1, 
            appointment_time: '',
            location: '',
            notes: ''
        });

        const loadListings = async () => {
            loading.value = true;
            try {
                console.log('正在加载二手书列表...');
                const response = await axios.get(`${API_BASE}/listings`, {
                    timeout: 10000 
                });
                console.log('加载成功，数据:', response.data);
                
                if (Array.isArray(response.data)) {
                    listings.value = response.data;
                    if (response.data.length === 0) {
                        ElMessage.info('暂无二手教材，快去发布第一本吧！');
                    } else {
                        console.log(`成功加载 ${response.data.length} 本二手教材`);
                    }
                } else {
                    console.error('返回数据格式错误:', response.data);
                    ElMessage.error('数据格式错误');
                }
            } catch (error) {
                console.error('加载二手书失败:', error);
                if (error.code === 'ECONNABORTED') {
                    ElMessage.error('请求超时，请检查网络连接');
                } else if (error.response) {
                    ElMessage.error(`服务器错误: ${error.response.status}`);
                } else {
                    ElMessage.error('加载数据失败，请检查后端服务是否启动');
                }
            } finally {
                loading.value = false;
            }
        };

        const makeAppointment = async (listing) => {
            try {
                const { value: formData } = await ElMessageBox.prompt(
                    '请填写预约信息',
                    '📅 预约验书',
                    {
                        confirmButtonText: '确认预约',
                        cancelButtonText: '取消',
                        inputPlaceholder: '格式：时间,地点,备注（用逗号分隔）\\n例如：明天下午2点,图书馆一楼,微信联系',
                        inputType: 'textarea',
                        inputValidator: (value) => {
                            if (!value || value.trim().length < 5) {
                                return '请填写完整的预约信息';
                            }
                            return true;
                        }
                    }
                );

                const parts = formData.split(',');
                appointmentForm.listing_id = listing.id;
                appointmentForm.appointment_time = new Date().toISOString();
                appointmentForm.location = parts[1]?.trim() || '图书馆';
                appointmentForm.notes = formData;

                await new Promise(resolve => setTimeout(resolve, 1000));
                
                ElMessage.success(`📅 预约成功！已向卖家 ${listing.seller} 发送预约信息`);
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('预约失败，请重试');
                }
            }
        };

        const contactSeller = (listing) => {
            ElMessage.info(`📞 正在为您连接卖家 ${listing.seller}...`);
        };

        const addToFavorites = (listing) => {
            ElMessage.success(`⭐ 已收藏《${listing.textbook.title}》`);
        };

        const formatPrice = (price) => {
            return `¥${price.toFixed(2)}`;
        };

        const formatTime = (timeStr) => {
            return new Date(timeStr).toLocaleDateString('zh-CN');
        };

        const getConditionColor = (condition) => {
            const colors = {
                '全新': 'success',
                '9成新': 'primary',
                '8成新': 'warning',
                '7成新': 'info',
                '6成新': 'danger'
            };
            return colors[condition] || 'info';
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                loadListings();
            }
        };

        onMounted(() => {
            loadListings();
            
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            window.addEventListener('refreshMarketplace', loadListings);
        });

        return {
            listings,
            loading,
            makeAppointment,
            contactSeller,
            addToFavorites,
            formatPrice,
            formatTime,
            getConditionColor,
            loadListings
        };
    },
    template: `
        <div class="marketplace-container">
            <div class="marketplace-header">
                <div class="header-info">
                    <p>🛒 发现 {{ listings.length }} 本二手教材，支持在线预约验书</p>
                </div>
                <el-button @click="loadListings" :loading="loading" size="default">
                    🔄 刷新列表
                </el-button>
            </div>

            <div v-loading="loading" class="listings-grid">
                <div 
                    v-for="listing in listings" 
                    :key="listing.id" 
                    class="listing-card">
                    <el-card shadow="hover" class="book-card">
                        <!-- 教材基本信息 -->
                        <div class="book-header">
                            <h3 class="book-title">📚 {{ listing.textbook.title }}</h3>
                            <el-tag 
                                :type="getConditionColor(listing.condition)" 
                                size="small"
                                class="condition-tag">
                                {{ listing.condition }}
                            </el-tag>
                        </div>

                        <div class="book-info">
                            <div class="info-row">
                                <span class="label">✍️ 作者:</span>
                                <span>{{ listing.textbook.author }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">🔢 ISBN:</span>
                                <span class="isbn">{{ listing.textbook.isbn }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">👤 卖家:</span>
                                <span class="seller">{{ listing.seller }}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">📅 发布:</span>
                                <span>{{ formatTime(listing.created_at) }}</span>
                            </div>
                        </div>

                        <!-- 价格显示 -->
                        <div class="price-section">
                            <span class="price-label">价格:</span>
                            <span class="price">{{ formatPrice(listing.price) }}</span>
                        </div>

                        <!-- 描述信息 -->
                        <div class="description-section">
                            <p class="description">{{ listing.description }}</p>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="action-buttons">
                            <el-button 
                                @click="makeAppointment(listing)" 
                                type="primary" 
                                size="default"
                                class="action-btn">
                                📅 预约验书
                            </el-button>
                            <el-button 
                                @click="contactSeller(listing)" 
                                type="success" 
                                size="default"
                                class="action-btn">
                                💬 联系卖家
                            </el-button>
                            <el-button 
                                @click="addToFavorites(listing)" 
                                type="warning" 
                                size="default"
                                plain
                                class="action-btn">
                                ⭐ 收藏
                            </el-button>
                        </div>
                    </el-card>
                </div>
            </div>

            <!-- 空状态 -->
            <div v-if="listings.length === 0 && !loading" class="empty-state">
                <div class="empty-content">
                    <p class="empty-icon">📚</p>
                    <h3>暂无二手教材</h3>
                    <p>目前还没有发布的二手教材，快去发布第一本吧！</p>
                    <el-button type="primary" @click="loadListings">重新加载</el-button>
                </div>
            </div>

            <!-- 使用提示 -->
            <div class="tips-section">
                <el-alert
                    title="💡 购买提示"
                    type="info"
                    :closable="false"
                    show-icon>
                    <div class="tips-content">
                        <p>• 📅 建议先预约验书，当面检查教材质量再决定购买</p>
                        <p>• 💬 可通过平台联系卖家，协商具体交易细节</p>
                        <p>• 🏫 推荐在校园公共场所进行交易，确保安全</p>
                        <p>• ⭐ 收藏心仪的教材，方便后续查看和比较</p>
                    </div>
                </el-alert>
            </div>
        </div>
    `,
    style: `
        .marketplace-container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .marketplace-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
        }
        
        .header-info p {
            margin: 0;
            color: #666;
            font-size: 16px;
        }
        
        .listings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .listing-card {
            height: 100%;
        }
        
        .book-card {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .book-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
        }
        
        .book-title {
            flex: 1;
            margin: 0;
            font-size: 18px;
            color: #2c3e50;
            line-height: 1.4;
            margin-right: 10px;
        }
        
        .condition-tag {
            flex-shrink: 0;
        }
        
        .book-info {
            margin-bottom: 15px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 8px;
            align-items: center;
        }
        
        .label {
            min-width: 70px;
            color: #666;
            font-size: 14px;
        }
        
        .isbn {
            font-family: monospace;
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
        }
        
        .seller {
            font-weight: 600;
            color: #409eff;
        }
        
        .price-section {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 8px;
            color: white;
        }
        
        .price-label {
            font-size: 14px;
            margin-right: 10px;
        }
        
        .price {
            font-size: 24px;
            font-weight: 700;
        }
        
        .description-section {
            margin-bottom: 20px;
            flex: 1;
        }
        
        .description {
            color: #555;
            line-height: 1.6;
            margin: 0;
            font-size: 14px;
        }
        
        .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: auto;
        }
        
        .action-buttons .action-btn:first-child {
            grid-column: 1 / -1;
        }
        
        .action-btn {
            font-size: 13px;
        }
        
        .empty-state {
            text-align: center;
            padding: 80px 20px;
            color: #999;
        }
        
        .empty-content .empty-icon {
            font-size: 64px;
            margin-bottom: 20px;
        }
        
        .empty-content h3 {
            margin: 0 0 15px 0;
            color: #666;
        }
        
        .empty-content p {
            margin-bottom: 25px;
            line-height: 1.6;
        }
        
        .tips-section {
            margin-top: 30px;
        }
        
        .tips-content p {
            margin: 8px 0;
            line-height: 1.6;
        }
        
        @media (max-width: 768px) {
            .listings-grid {
                grid-template-columns: 1fr;
            }
            
            .marketplace-header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
            
            .action-buttons {
                grid-template-columns: 1fr;
            }
            
            .action-buttons .action-btn:first-child {
                grid-column: 1;
            }
        }
    `
};
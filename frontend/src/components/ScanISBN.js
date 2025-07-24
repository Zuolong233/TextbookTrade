const { ref, reactive } = Vue;
const { ElMessage } = ElementPlus;

export default {
    name: 'ScanISBN',
    setup() {
        const isbnInput = ref('');
        const qrCodeUrl = ref('');
        const bookInfo = ref(null);
        const loading = ref(false);
        const API_BASE = 'http://localhost:5000/api';

        const scanISBN = async () => {
            if (!isbnInput.value.trim()) {
                ElMessage.warning('请输入ISBN号');
                return;
            }

            loading.value = true;
            try {
                const response = await axios.post(`${API_BASE}/search_book_by_isbn`, {
                    isbn: isbnInput.value.trim()
                });
                bookInfo.value = response.data;
                ElMessage.success('📚 教材信息识别成功！');
            } catch (error) {
                console.error('ISBN识别失败:', error);
                ElMessage.error('识别失败，请检查ISBN号或网络连接');
                bookInfo.value = null;
            } finally {
                loading.value = false;
            }
        };

        const generateQR = async () => {
            if (!isbnInput.value.trim()) {
                ElMessage.warning('请先输入ISBN号');
                return;
            }

            try {
                const response = await axios.post(`${API_BASE}/generate_qr`, {
                    text: isbnInput.value.trim()
                });
                qrCodeUrl.value = response.data.qr_code;
                ElMessage.success('📱 二维码生成成功！');
            } catch (error) {
                console.error('二维码生成失败:', error);
                ElMessage.error('二维码生成失败');
            }
        };

        const clearData = () => {
            isbnInput.value = '';
            bookInfo.value = null;
            qrCodeUrl.value = '';
        };

        const sampleISBNs = [
            '9787111234567',
            '9787302123456',
            '9787508123456',
            '9787040123456'
        ];

        const useSampleISBN = (isbn) => {
            isbnInput.value = isbn;
            scanISBN();
        };

        return {
            isbnInput,
            qrCodeUrl,
            bookInfo,
            loading,
            scanISBN,
            generateQR,
            clearData,
            sampleISBNs,
            useSampleISBN
        };
    },
    template: `
        <div class="scan-isbn-container">
            <div class="scan-section">
                <!-- ISBN输入区域 -->
                <div class="input-section">
                    <h3>📖 ISBN号识别</h3>
                    <div class="input-group">
                        <el-input
                            v-model="isbnInput"
                            placeholder="请输入13位ISBN号，如：9787111234567"
                            size="large"
                            clearable
                            class="isbn-input">
                            <template #prefix>
                                <span>📚</span>
                            </template>
                        </el-input>
                        <el-button 
                            @click="scanISBN" 
                            :loading="loading" 
                            type="primary" 
                            size="large"
                            class="scan-btn">
                            🔍 识别教材
                        </el-button>
                    </div>
                    
                    <div class="action-buttons">
                        <el-button @click="generateQR" size="default" type="success">
                            📱 生成二维码
                        </el-button>
                        <el-button @click="clearData" size="default">
                            🗑️ 清空
                        </el-button>
                    </div>
                </div>

                <!-- 示例ISBN -->
                <div class="sample-section">
                    <h4>💡 试试这些示例ISBN:</h4>
                    <div class="sample-list">
                        <el-button 
                            v-for="isbn in sampleISBNs" 
                            :key="isbn"
                            @click="useSampleISBN(isbn)"
                            size="small"
                            type="info"
                            plain>
                            {{ isbn }}
                        </el-button>
                    </div>
                </div>

                <!-- 结果显示区域 -->
                <div class="results-section">
                    <el-row :gutter="30">
                        <!-- 教材信息 -->
                        <el-col :span="12">
                            <div v-if="bookInfo" class="book-info-card">
                                <h3>📚 教材信息</h3>
                                <el-card shadow="hover">
                                    <div class="book-details">
                                        <div class="detail-item">
                                            <label>📖 书名:</label>
                                            <span>{{ bookInfo.title }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>✍️ 作者:</label>
                                            <span>{{ bookInfo.author }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>🏢 出版社:</label>
                                            <span>{{ bookInfo.publisher }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>📅 出版年份:</label>
                                            <span>{{ bookInfo.year }}</span>
                                        </div>
                                        <div class="detail-item">
                                            <label>🔢 ISBN:</label>
                                            <span class="isbn-code">{{ bookInfo.isbn }}</span>
                                        </div>
                                    </div>
                                </el-card>
                            </div>
                        </el-col>

                        <!-- 二维码显示 -->
                        <el-col :span="12">
                            <div v-if="qrCodeUrl" class="qr-code-card">
                                <h3>📱 二维码</h3>
                                <el-card shadow="hover" class="qr-card">
                                    <div class="qr-container">
                                        <img :src="qrCodeUrl" alt="二维码" class="qr-image" />
                                        <p class="qr-desc">扫描二维码分享教材信息</p>
                                    </div>
                                </el-card>
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <!-- 使用说明 -->
                <div class="help-section">
                    <el-alert
                        title="💡 使用说明"
                        type="info"
                        :closable="false"
                        show-icon>
                        <p>• ISBN号通常印在图书背面条形码上方，由13位数字组成</p>
                        <p>• 识别后可自动匹配课程信息，方便查找对应教材</p>
                        <p>• 生成的二维码可分享给其他同学，便于快速查看教材信息</p>
                    </el-alert>
                </div>
            </div>
        </div>
    `,
    style: `
        .scan-isbn-container {
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .input-section {
            margin-bottom: 30px;
        }
        
        .input-section h3 {
            margin-bottom: 20px;
            color: #2c3e50;
            font-size: 20px;
        }
        
        .input-group {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .isbn-input {
            flex: 1;
        }
        
        .scan-btn {
            min-width: 120px;
        }
        
        .action-buttons {
            display: flex;
            gap: 10px;
        }
        
        .sample-section {
            margin-bottom: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 12px;
        }
        
        .sample-section h4 {
            margin-bottom: 15px;
            color: #555;
        }
        
        .sample-list {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .results-section {
            margin-bottom: 30px;
        }
        
        .book-info-card h3,
        .qr-code-card h3 {
            margin-bottom: 15px;
            color: #2c3e50;
        }
        
        .book-details {
            padding: 10px 0;
        }
        
        .detail-item {
            display: flex;
            margin-bottom: 12px;
            align-items: center;
        }
        
        .detail-item label {
            min-width: 100px;
            font-weight: 600;
            color: #666;
        }
        
        .detail-item span {
            color: #2c3e50;
        }
        
        .isbn-code {
            font-family: monospace;
            background: #f1f3f4;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
        }
        
        .qr-container {
            text-align: center;
            padding: 20px;
        }
        
        .qr-image {
            max-width: 200px;
            max-height: 200px;
            border: 2px solid #e1e8ed;
            border-radius: 8px;
        }
        
        .qr-desc {
            margin-top: 15px;
            color: #666;
            font-size: 14px;
        }
        
        .help-section {
            margin-top: 30px;
        }
        
        .help-section p {
            margin: 8px 0;
            line-height: 1.6;
        }
    `
};
const { reactive, ref } = Vue;
const { ElMessage } = ElementPlus;

export default {
    name: 'UserLogin',
    setup() {
        const form = reactive({
            username: '',
            password: '',
            rememberMe: false
        });

        const loading = ref(false);
        const API_BASE = 'http://localhost:5000/api';

        const loginUser = async () => {
            if (!form.username.trim()) {
                ElMessage.warning('请输入用户名或邮箱');
                return;
            }
            if (!form.password.trim()) {
                ElMessage.warning('请输入密码');
                return;
            }

            loading.value = true;
            try {
                const response = await axios.post(`${API_BASE}/login`, {
                    username: form.username,
                    password: form.password
                });
                
                if (response.data.success) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                    localStorage.setItem('token', response.data.token);
                    
                    ElMessage.success(`🎉 欢迎回来，${response.data.user.username}！`);
                    
                    window.dispatchEvent(new CustomEvent('userLoggedIn', {
                        detail: response.data.user
                    }));
                    
                    resetForm();
                } else {
                    ElMessage.error(response.data.message || '登录失败');
                }
            } catch (error) {
                console.error('登录失败:', error);
                ElMessage.error('登录失败，请检查网络连接');
            } finally {
                loading.value = false;
            }
        };

        const resetForm = () => {
            form.username = '';
            form.password = '';
            form.rememberMe = false;
        };

        const quickLogin = () => {
            form.username = 'demo@example.com';
            form.password = '123456';
            ElMessage.info('已填入演示账号，点击登录即可体验');
        };

        return {
            form,
            loading,
            loginUser,
            resetForm,
            quickLogin
        };
    },
    template: `
        <div class="login-container">
            <div class="login-form">
                <div class="login-header">
                    <h2>🔐 用户登录</h2>
                    <p>登录后可发布和购买二手教材</p>
                </div>

                <el-form 
                    :model="form" 
                    label-width="80px" 
                    size="default"
                    class="user-form">

                    <el-form-item label="账号" required>
                        <el-input 
                            v-model="form.username"
                            placeholder="请输入用户名或邮箱"
                            clearable
                            prefix-icon="User">
                        </el-input>
                    </el-form-item>

                    <el-form-item label="密码" required>
                        <el-input 
                            v-model="form.password"
                            type="password"
                            placeholder="请输入密码"
                            show-password
                            prefix-icon="Lock">
                        </el-input>
                    </el-form-item>

                    <el-form-item>
                        <div class="login-options">
                            <el-checkbox v-model="form.rememberMe">
                                记住我
                            </el-checkbox>
                            <el-link type="primary" :underline="false">
                                忘记密码？
                            </el-link>
                        </div>
                    </el-form-item>

                    <!-- 操作按钮 -->
                    <div class="form-actions">
                        <el-button 
                            @click="loginUser"
                            type="primary"
                            size="large"
                            :loading="loading"
                            class="login-btn">
                            <span v-if="!loading">🚀 立即登录</span>
                            <span v-else>登录中...</span>
                        </el-button>
                        
                        <el-button 
                            @click="quickLogin"
                            type="success"
                            size="large"
                            plain
                            class="demo-btn">
                            ⚡ 演示登录
                        </el-button>
                    </div>

                    <div class="register-link">
                        <span>还没有账号？</span>
                        <el-link type="primary" :underline="false">
                            立即注册
                        </el-link>
                    </div>
                </el-form>
            </div>

            <!-- 登录说明 -->
            <div class="login-tips">
                <el-alert
                    title="💡 登录说明"
                    type="info"
                    :closable="false"
                    show-icon>
                    <div class="tips-content">
                        <p>• 🔐 可使用用户名或邮箱登录</p>
                        <p>• 📚 登录后可发布和管理自己的二手教材</p>
                        <p>• 💬 登录用户可联系卖家并预约验书</p>
                        <p>• ⚡ 点击"演示登录"可快速体验功能</p>
                        <p>• 🔒 我们会保护您的账号安全</p>
                    </div>
                </el-alert>
            </div>
        </div>
    `,
    style: `
        .login-container {
            max-width: 500px;
            margin: 0 auto;
        }
        
        .login-form {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            margin-bottom: 25px;
        }
        
        .login-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .login-header h2 {
            margin: 0 0 10px 0;
            color: #2c3e50;
            font-size: 24px;
            font-weight: 600;
        }
        
        .login-header p {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        
        .login-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
        }
        
        .form-actions {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 30px;
        }
        
        .login-btn,
        .demo-btn {
            width: 100%;
            font-weight: 600;
        }
        
        .register-link {
            text-align: center;
            margin-top: 20px;
            color: #666;
        }
        
        .login-tips {
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
        
        @media (max-width: 768px) {
            .login-form {
                padding: 30px 20px;
            }
            
            .login-options {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
        }
    `
};
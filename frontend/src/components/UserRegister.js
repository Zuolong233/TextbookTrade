const { reactive, ref } = Vue;
const { ElMessage } = ElementPlus;

export default {
    name: 'UserRegister',
    setup() {
        const form = reactive({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            major: '',
            grade: '',
            student_id: '',
            phone: '',
            agreement: false
        });

        const loading = ref(false);
        const API_BASE = 'http://localhost:5000/api';

        const majorOptions = [
            '计算机科学与技术',
            '软件工程',
            '数据科学与大数据技术',
            '人工智能',
            '网络工程',
            '信息安全',
            '电子信息工程',
            '通信工程',
            '自动化',
            '电气工程及其自动化',
            '机械工程',
            '土木工程',
            '建筑学',
            '经济学',
            '金融学',
            '会计学',
            '工商管理',
            '市场营销',
            '英语',
            '汉语言文学',
            '新闻学',
            '法学',
            '其他'
        ];

        const gradeOptions = [
            '大一',
            '大二', 
            '大三',
            '大四',
            '研一',
            '研二',
            '研三',
            '博士生'
        ];

        const registerUser = async () => {
            if (!validateForm()) {
                return;
            }

            loading.value = true;
            try {
                const response = await axios.post(`${API_BASE}/register`, {
                    username: form.username,
                    email: form.email,
                    password: form.password,
                    major: form.major,
                    grade: form.grade,
                    student_id: form.student_id,
                    phone: form.phone
                });
                
                if (response.data.success) {
                    ElMessage.success('🎉 注册成功！欢迎加入校园二手教材交易平台');
                    resetForm();
                    
                    setTimeout(() => {
                        ElMessage.info('请前往登录页面登录您的账号');
                        window.dispatchEvent(new CustomEvent('switchToLogin'));
                    }, 1500);
                } else {
                    ElMessage.error(response.data.message || '注册失败');
                }
            } catch (error) {
                console.error('注册失败:', error);
                ElMessage.error('注册失败，请检查网络连接');
            } finally {
                loading.value = false;
            }
        };

        const validateForm = () => {
            if (!form.username.trim()) {
                ElMessage.warning('请输入用户名');
                return false;
            }
            if (form.username.length < 3) {
                ElMessage.warning('用户名至少3个字符');
                return false;
            }
            if (!form.email.trim()) {
                ElMessage.warning('请输入邮箱');
                return false;
            }
            if (!isValidEmail(form.email)) {
                ElMessage.warning('请输入有效的邮箱地址');
                return false;
            }
            if (!form.password) {
                ElMessage.warning('请输入密码');
                return false;
            }
            if (form.password.length < 6) {
                ElMessage.warning('密码至少6个字符');
                return false;
            }
            if (form.password !== form.confirmPassword) {
                ElMessage.warning('两次输入的密码不一致');
                return false;
            }
            if (!form.major) {
                ElMessage.warning('请选择专业');
                return false;
            }
            if (!form.grade) {
                ElMessage.warning('请选择年级');
                return false;
            }
            if (!form.agreement) {
                ElMessage.warning('请阅读并同意用户协议');
                return false;
            }
            return true;
        };

        const isValidEmail = (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };

        const resetForm = () => {
            Object.keys(form).forEach(key => {
                if (key === 'agreement') {
                    form[key] = false;
                } else {
                    form[key] = '';
                }
            });
        };

        const getPasswordStrength = () => {
            if (!form.password) return { text: '', color: '' };
            
            const password = form.password;
            let strength = 0;
            
            if (password.length >= 6) strength++;
            if (password.length >= 10) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            if (strength <= 2) return { text: '弱', color: '#f56c6c' };
            if (strength <= 4) return { text: '中', color: '#e6a23c' };
            return { text: '强', color: '#67c23a' };
        };

        return {
            form,
            loading,
            majorOptions,
            gradeOptions,
            registerUser,
            resetForm,
            getPasswordStrength
        };
    },
    template: `
        <div class="register-container">
            <div class="register-form">
                <el-form 
                    :model="form" 
                    label-width="100px" 
                    size="default"
                    class="user-form">

                    <!-- 基本信息 -->
                    <div class="form-section">
                        <h3>👤 基本信息</h3>
                        
                        <el-form-item label="👤 用户名" required>
                            <el-input 
                                v-model="form.username"
                                placeholder="请输入用户名，至少3个字符"
                                clearable
                                maxlength="20"
                                show-word-limit />
                        </el-form-item>

                        <el-form-item label="📧 邮箱" required>
                            <el-input 
                                v-model="form.email"
                                type="email"
                                placeholder="请输入邮箱地址"
                                clearable />
                        </el-form-item>

                        <el-form-item label="🔒 密码" required>
                            <el-input 
                                v-model="form.password"
                                type="password"
                                placeholder="请输入密码，至少6个字符"
                                show-password
                                clearable />
                            <div v-if="form.password" class="password-strength">
                                <span>密码强度: </span>
                                <span :style="{ color: getPasswordStrength().color }">
                                    {{ getPasswordStrength().text }}
                                </span>
                            </div>
                        </el-form-item>

                        <el-form-item label="🔐 确认密码" required>
                            <el-input 
                                v-model="form.confirmPassword"
                                type="password"
                                placeholder="请再次输入密码"
                                show-password
                                clearable />
                        </el-form-item>
                    </div>

                    <!-- 学籍信息 -->
                    <div class="form-section">
                        <h3>🎓 学籍信息</h3>
                        
                        <el-form-item label="📚 专业" required>
                            <el-select 
                                v-model="form.major" 
                                placeholder="请选择专业"
                                filterable
                                class="full-width">
                                <el-option
                                    v-for="major in majorOptions"
                                    :key="major"
                                    :label="major"
                                    :value="major">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="📅 年级" required>
                            <el-select 
                                v-model="form.grade" 
                                placeholder="请选择年级"
                                class="full-width">
                                <el-option
                                    v-for="grade in gradeOptions"
                                    :key="grade"
                                    :label="grade"
                                    :value="grade">
                                </el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="🆔 学号">
                            <el-input 
                                v-model="form.student_id"
                                placeholder="请输入学号（可选）"
                                clearable />
                        </el-form-item>

                        <el-form-item label="📱 手机号">
                            <el-input 
                                v-model="form.phone"
                                placeholder="请输入手机号（可选）"
                                clearable
                                maxlength="11" />
                        </el-form-item>
                    </div>

                    <!-- 用户协议 -->
                    <div class="form-section">
                        <el-form-item>
                            <el-checkbox v-model="form.agreement" class="agreement-checkbox">
                                我已阅读并同意
                                <el-link type="primary" :underline="false">《用户协议》</el-link>
                                和
                                <el-link type="primary" :underline="false">《隐私政策》</el-link>
                            </el-checkbox>
                        </el-form-item>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="form-actions">
                        <el-button 
                            @click="registerUser"
                            type="primary"
                            size="large"
                            :loading="loading"
                            class="register-btn">
                            <span v-if="!loading">🚀 立即注册</span>
                            <span v-else>注册中...</span>
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

            <!-- 注册须知 -->
            <div class="register-tips">
                <el-alert
                    title="📋 注册须知"
                    type="info"
                    :closable="false"
                    show-icon>
                    <div class="tips-content">
                        <p>• 👤 请使用真实信息注册，便于建立诚信交易环境</p>
                        <p>• 📧 邮箱将用于接收重要通知和找回密码</p>
                        <p>• 🎓 学籍信息有助于匹配相关课程和教材</p>
                        <p>• 🔒 我们承诺保护您的个人隐私信息</p>
                        <p>• 📚 注册后即可发布和购买二手教材</p>
                    </div>
                </el-alert>
            </div>
        </div>
    `,
    style: `
        .register-container {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .register-form {
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
            padding-bottom: 0;
        }
        
        .form-section h3 {
            margin: 0 0 20px 0;
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            padding-left: 10px;
            border-left: 4px solid #409eff;
        }
        
        .password-strength {
            margin-top: 5px;
            font-size: 12px;
            color: #666;
        }
        
        .full-width {
            width: 100%;
        }
        
        .agreement-checkbox {
            line-height: 1.6;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }
        
        .register-btn {
            min-width: 140px;
            font-weight: 600;
        }
        
        .reset-btn {
            min-width: 120px;
        }
        
        .register-tips {
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
            .register-form {
                padding: 20px;
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .register-btn,
            .reset-btn {
                width: 100%;
            }
        }
    `
};
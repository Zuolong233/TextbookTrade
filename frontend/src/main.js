const { createApp } = Vue;
async function loadComponents() {
    try {
        const CourseTree = await import('./components/CourseTree.js').then(m => m.default);
        const TextbookList = await import('./components/TextbookList.js').then(m => m.default);
        const ScanISBN = await import('./components/ScanISBN.js').then(m => m.default);
        const BookMarketplace = await import('./components/BookMarketplace.js').then(m => m.default);
        const PublishBook = await import('./components/PublishBook.js').then(m => m.default);
        const UserRegister = await import('./components/UserRegister.js').then(m => m.default);
        const UserLogin = await import('./components/UserLogin.js').then(m => m.default);
        
        return { CourseTree, TextbookList, ScanISBN, BookMarketplace, PublishBook, UserRegister, UserLogin };
    } catch (error) {
        console.error('加载组件失败:', error);
        return {};
    }
}

const App = {
    name: 'App',
    setup() {
        const { ref, reactive, onMounted, computed } = Vue;
        const { ElMessage, ElMessageBox } = ElementPlus;

        const activeTab = ref('home');
        const selectedCourse = ref(null);
        const currentUser = ref(null);
        const API_BASE = 'http://localhost:5000/api';

        const checkLoginStatus = () => {
            const user = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            if (user && token) {
                currentUser.value = JSON.parse(user);
            }
        };

        const switchTab = (tab) => {
            activeTab.value = tab;
        };

        const onCourseSelect = (course) => {
            selectedCourse.value = course;
            activeTab.value = 'textbooks';
        };

        const logout = () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            currentUser.value = null;
            ElMessage.success('已退出登录');
            activeTab.value = 'home';
        };

        onMounted(() => {
            checkLoginStatus();
            
            window.addEventListener('userLoggedIn', (event) => {
                currentUser.value = event.detail;
            });
            
            window.addEventListener('switchToLogin', () => {
                activeTab.value = 'login';
            });
        });

        return {
            activeTab,
            selectedCourse,
            currentUser,
            API_BASE,
            switchTab,
            onCourseSelect,
            logout
        };
    },
    template: `
        <div class="app-container">
            <el-container>
                <!-- 头部导航 -->
                <el-header class="app-header">
                    <div class="header-content">
                        <h1 class="app-title">📚 校园二手教材精准交易平台</h1>
                        <nav class="nav-menu">
                            <el-button 
                                @click="switchTab('home')" 
                                :type="activeTab === 'home' ? 'primary' : 'default'"
                                size="default">
                                🏠 首页
                            </el-button>
                            <el-button 
                                @click="switchTab('scan')" 
                                :type="activeTab === 'scan' ? 'primary' : 'default'"
                                size="default">
                                📱 扫码识别
                            </el-button>
                            <el-button 
                                @click="switchTab('marketplace')" 
                                :type="activeTab === 'marketplace' ? 'primary' : 'default'"
                                size="default">
                                🛒 二手市场
                            </el-button>
                            <el-button 
                                @click="switchTab('publish')" 
                                :type="activeTab === 'publish' ? 'primary' : 'default'"
                                size="default">
                                ✏️ 发布
                            </el-button>
                        </nav>
                        
                        <!-- 用户状态区域 -->
                        <div class="user-area">
                            <div v-if="currentUser" class="user-info">
                                <span class="welcome-text">👋 {{ currentUser.username }}</span>
                                <el-button @click="logout" type="danger" size="small" plain>
                                    退出
                                </el-button>
                            </div>
                            <div v-else class="auth-buttons">
                                <el-button 
                                    @click="switchTab('login')" 
                                    :type="activeTab === 'login' ? 'primary' : 'success'"
                                    size="default">
                                    🔐 登录
                                </el-button>
                                <el-button 
                                    @click="switchTab('register')" 
                                    :type="activeTab === 'register' ? 'primary' : 'default'"
                                    size="default">
                                    👤 注册
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-header>

                <!-- 主体内容 -->
                <el-main class="app-main">
                    <!-- 首页 - 课程树 -->
                    <div v-if="activeTab === 'home'" class="tab-panel">
                        <h2 class="panel-title">📖 课程分类浏览</h2>
                        <p class="panel-desc">按专业和学期分类查看课程，点击课程可查看相关教材</p>
                        <course-tree @course-select="onCourseSelect" />
                    </div>

                    <!-- 教材列表 -->
                    <div v-if="activeTab === 'textbooks'" class="tab-panel">
                        <h2 class="panel-title">📚 {{ selectedCourse?.name || '课程' }} - 教材列表</h2>
                        <textbook-list :course="selectedCourse" @view-listings="switchTab('marketplace')" />
                    </div>

                    <!-- 扫码识别 -->
                    <div v-if="activeTab === 'scan'" class="tab-panel">
                        <h2 class="panel-title">📱 ISBN扫码识别</h2>
                        <p class="panel-desc">扫描或输入教材ISBN号，自动匹配课程信息</p>
                        <scan-isbn />
                    </div>

                    <!-- 二手市场 -->
                    <div v-if="activeTab === 'marketplace'" class="tab-panel">
                        <h2 class="panel-title">🛒 二手教材市场</h2>
                        <p class="panel-desc">浏览和购买二手教材，支持在线预约验书</p>
                        <book-marketplace />
                    </div>

                    <!-- 发布二手书 -->
                    <div v-if="activeTab === 'publish'" class="tab-panel">
                        <h2 class="panel-title">✏️ 发布二手教材</h2>
                        <p class="panel-desc">发布你的二手教材信息</p>
                        <publish-book />
                    </div>

                    <!-- 用户登录 -->
                    <div v-if="activeTab === 'login'" class="tab-panel">
                        <h2 class="panel-title">🔐 用户登录</h2>
                        <p class="panel-desc">登录后可发布和购买二手教材</p>
                        <user-login />
                    </div>

                    <!-- 用户注册 -->
                    <div v-if="activeTab === 'register'" class="tab-panel">
                        <h2 class="panel-title">👤 用户注册</h2>
                        <p class="panel-desc">注册账号以使用完整功能</p>
                        <user-register />
                    </div>
                </el-main>

                <!-- 底部 -->
                <el-footer class="app-footer">
                    <div class="footer-content">
                        <p>🎓 校园二手教材精准交易平台 - 让教材流转更简单</p>
                        <p class="feature-list">
                            <span>📱 扫码识别</span>
                            <span>🌳 课程树展示</span>
                            <span>📅 在线预约验书</span>
                        </p>
                    </div>
                </el-footer>
            </el-container>
        </div>
    `,
    style: `
        .app-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .app-header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            padding: 0 20px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100%;
            max-width: 1400px;
            margin: 0 auto;
            gap: 20px;
        }
        
        .app-title {
            margin: 0;
            font-size: 24px;
            color: #2c3e50;
            font-weight: 600;
        }
        
        .nav-menu {
            display: flex;
            gap: 10px;
            flex: 1;
            justify-content: center;
        }
        
        .user-area {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .welcome-text {
            color: #2c3e50;
            font-weight: 500;
            font-size: 14px;
        }
        
        .auth-buttons {
            display: flex;
            gap: 8px;
        }
        
        .app-main {
            padding: 30px 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .tab-panel {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            min-height: 500px;
        }
        
        .panel-title {
            margin: 0 0 15px 0;
            color: #2c3e50;
            font-size: 28px;
            font-weight: 600;
        }
        
        .panel-desc {
            margin: 0 0 25px 0;
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .app-footer {
            background: rgba(44, 62, 80, 0.9);
            color: white;
            text-align: center;
            padding: 20px;
        }
        
        .footer-content p {
            margin: 8px 0;
        }
        
        .feature-list {
            display: flex;
            justify-content: center;
            gap: 30px;
            font-size: 14px;
        }
        
        .feature-list span {
            opacity: 0.8;
        }
        
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
            }
            
            .nav-menu {
                flex-wrap: wrap;
                justify-content: center;
                flex: none;
            }
            
            .user-area {
                width: 100%;
                justify-content: center;
            }
            
            .auth-buttons {
                justify-content: center;
            }
            
            .feature-list {
                flex-direction: column;
                gap: 8px;
            }
        }
    `
};

async function initApp() {
    const app = createApp(App);
    app.use(ElementPlus);

    try {
        const components = await loadComponents();
        
        if (components.CourseTree) {
            app.component('course-tree', components.CourseTree);
        } else {
            app.component('course-tree', {
                template: '<div style="text-align:center; padding:50px; color:#666;">课程树组件加载中...</div>'
            });
        }
        
        if (components.TextbookList) {
            app.component('textbook-list', components.TextbookList);
        } else {
            app.component('textbook-list', {
                template: '<div style="text-align:center; padding:50px; color:#666;">教材列表组件加载中...</div>'
            });
        }
        
        if (components.ScanISBN) {
            app.component('scan-isbn', components.ScanISBN);
        } else {
            app.component('scan-isbn', {
                template: '<div style="text-align:center; padding:50px; color:#666;">扫码组件加载中...</div>'
            });
        }
        
        if (components.BookMarketplace) {
            app.component('book-marketplace', components.BookMarketplace);
        } else {
            app.component('book-marketplace', {
                template: '<div style="text-align:center; padding:50px; color:#666;">二手市场组件加载中...</div>'
            });
        }
        
        if (components.PublishBook) {
            app.component('publish-book', components.PublishBook);
        } else {
            app.component('publish-book', {
                template: '<div style="text-align:center; padding:50px; color:#666;">发布组件加载中...</div>'
            });
        }
        
        if (components.UserRegister) {
            app.component('user-register', components.UserRegister);
        } else {
            app.component('user-register', {
                template: '<div style="text-align:center; padding:50px; color:#666;">注册组件加载中...</div>'
            });
        }
        
        if (components.UserLogin) {
            app.component('user-login', components.UserLogin);
        } else {
            app.component('user-login', {
                template: '<div style="text-align:center; padding:50px; color:#666;">登录组件加载中...</div>'
            });
        }
        
    } catch (error) {
        console.error('组件注册失败:', error);
        
        app.component('course-tree', {
            template: '<div style="text-align:center; padding:50px; color:#666;">课程树组件加载失败</div>'
        });
        app.component('textbook-list', {
            template: '<div style="text-align:center; padding:50px; color:#666;">教材列表组件加载失败</div>'
        });
        app.component('scan-isbn', {
            template: '<div style="text-align:center; padding:50px; color:#666;">扫码组件加载失败</div>'
        });
        app.component('book-marketplace', {
            template: '<div style="text-align:center; padding:50px; color:#666;">二手市场组件加载失败</div>'
        });
        app.component('publish-book', {
            template: '<div style="text-align:center; padding:50px; color:#666;">发布组件加载失败</div>'
        });
        app.component('user-register', {
            template: '<div style="text-align:center; padding:50px; color:#666;">注册组件加载失败</div>'
        });
        app.component('user-login', {
            template: '<div style="text-align:center; padding:50px; color:#666;">登录组件加载失败</div>'
        });
    }

    app.mount('#app');
}

initApp();
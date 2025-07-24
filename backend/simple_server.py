
try:
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import json
    import urllib.parse
    import sqlite3
    import os
    from datetime import datetime
    
    def init_database():
        conn = sqlite3.connect('textbook_exchange.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                major TEXT,
                grade TEXT,
                student_id TEXT,
                phone TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS listings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT,
                isbn TEXT,
                publisher TEXT,
                seller_id INTEGER,
                seller_name TEXT,
                price REAL NOT NULL,
                condition TEXT,
                description TEXT,
                contact_method TEXT,
                contact_info TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_sold BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (seller_id) REFERENCES users (id)
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                session_token TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, format, *args):
            pass
            
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
        
        def do_OPTIONS(self):
            self.send_response(200)
            self.end_headers()
        
        def do_GET(self):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            if self.path == '/':
                data = {'message': 'Backend running!', 'status': 'ok'}
            elif self.path == '/api/courses/tree':
                data = {
                    "计算机科学": {
                        "第一学期": [
                            {"id": 1, "name": "高等数学", "code": "MATH001"},
                            {"id": 2, "name": "线性代数", "code": "MATH002"}
                        ],
                        "第二学期": [
                            {"id": 3, "name": "数据结构", "code": "CS002"}
                        ]
                    },
                    "通用课程": {
                        "第一学期": [
                            {"id": 4, "name": "大学英语", "code": "ENG001"}
                        ]
                    }
                }
            elif self.path == '/api/listings':
                conn = sqlite3.connect('textbook_exchange.db')
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT id, title, author, isbn, publisher, seller_name, price, 
                           condition, description, created_at 
                    FROM listings 
                    WHERE is_sold = FALSE 
                    ORDER BY created_at DESC
                ''')
                listings = cursor.fetchall()
                conn.close()
                
                data = []
                for listing in listings:
                    data.append({
                        "id": listing[0],
                        "textbook": {
                            "title": listing[1],
                            "author": listing[2] or "未知作者",
                            "isbn": listing[3] or "无ISBN"
                        },
                        "seller": listing[5] or "匿名用户",
                        "price": listing[6],
                        "condition": listing[7],
                        "description": listing[8] or "无描述",
                        "created_at": listing[9]
                    })
            else:
                data = {'error': 'Not found'}
            
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
        
        def do_POST(self):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length > 0:
                post_data = self.rfile.read(content_length)
                try:
                    request_data = json.loads(post_data.decode('utf-8'))
                except:
                    request_data = {}
            else:
                request_data = {}
            
            if self.path == '/api/search_book_by_isbn':
                isbn = request_data.get('isbn', '')
                data = {
                    'isbn': isbn,
                    'title': f'示例教材-{isbn[-4:] if isbn else "0000"}',
                    'author': '示例作者',
                    'publisher': '示例出版社',
                    'year': '2023'
                }
            elif self.path == '/api/generate_qr':
                data = {'qr_code': 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" dy=".3em" font-family="monospace" font-size="8">二维码已生成</text></svg>'}
            elif self.path == '/api/register':
                username = request_data.get('username', '').strip()
                email = request_data.get('email', '').strip()
                password = request_data.get('password', '')
                major = request_data.get('major', '')
                grade = request_data.get('grade', '')
                student_id = request_data.get('student_id', '')
                phone = request_data.get('phone', '')
                
                if not username or not email or not password:
                    data = {'success': False, 'message': '请填写必要信息'}
                else:
                    try:
                        conn = sqlite3.connect('textbook_exchange.db')
                        cursor = conn.cursor()
                        cursor.execute('''
                            INSERT INTO users (username, email, password, major, grade, student_id, phone)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        ''', (username, email, password, major, grade, student_id, phone))
                        conn.commit()
                        user_id = cursor.lastrowid
                        conn.close()
                        data = {'success': True, 'message': '注册成功', 'user_id': user_id}
                    except sqlite3.IntegrityError:
                        data = {'success': False, 'message': '用户名或邮箱已存在'}
                    except Exception as e:
                        data = {'success': False, 'message': f'注册失败: {str(e)}'}
            
            elif self.path == '/api/login':
                username = request_data.get('username', '').strip()
                password = request_data.get('password', '')
                
                if not username or not password:
                    data = {'success': False, 'message': '请输入用户名和密码'}
                else:
                    conn = sqlite3.connect('textbook_exchange.db')
                    cursor = conn.cursor()
                    cursor.execute('''
                        SELECT id, username, email, major, grade 
                        FROM users 
                        WHERE (username = ? OR email = ?) AND password = ?
                    ''', (username, username, password))
                    user = cursor.fetchone()
                    
                    if user:
                        import uuid
                        session_token = str(uuid.uuid4())
                        cursor.execute('''
                            INSERT INTO sessions (user_id, session_token, expires_at)
                            VALUES (?, ?, datetime('now', '+7 days'))
                        ''', (user[0], session_token))
                        conn.commit()
                        
                        data = {
                            'success': True,
                            'message': '登录成功',
                            'user': {
                                'id': user[0],
                                'username': user[1],
                                'email': user[2],
                                'major': user[3],
                                'grade': user[4]
                            },
                            'token': session_token
                        }
                    else:
                        data = {'success': False, 'message': '用户名或密码错误'}
                    
                    conn.close()
            
            elif self.path == '/api/publish':
                title = request_data.get('title', '').strip()
                author = request_data.get('author', '')
                isbn = request_data.get('isbn', '')
                publisher = request_data.get('publisher', '')
                price = request_data.get('price', 0)
                condition = request_data.get('condition', '8成新')
                description = request_data.get('description', '')
                contact_method = request_data.get('contact_method', 'wechat')
                contact_info = request_data.get('contact_info', '')
                seller_name = request_data.get('seller_name', '匿名用户')
                seller_id = request_data.get('seller_id', 1)
                
                if not title or not price or not contact_info:
                    data = {'success': False, 'message': '请填写必要信息'}
                else:
                    try:
                        conn = sqlite3.connect('textbook_exchange.db')
                        cursor = conn.cursor()
                        cursor.execute('''
                            INSERT INTO listings (title, author, isbn, publisher, seller_id, seller_name,
                                                 price, condition, description, contact_method, contact_info)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (title, author, isbn, publisher, seller_id, seller_name, 
                              price, condition, description, contact_method, contact_info))
                        conn.commit()
                        listing_id = cursor.lastrowid
                        conn.close()
                        data = {'success': True, 'message': '发布成功', 'listing_id': listing_id}
                    except Exception as e:
                        data = {'success': False, 'message': f'发布失败: {str(e)}'}
            else:
                data = {'message': 'Success', 'received': request_data}
            
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    print("=" * 50)
    print("  校园二手教材交易平台 - 后端服务")
    print("=" * 50)
    print()
    print("正在初始化数据库...")
    init_database()
    print("✅ 数据库初始化完成!")
    print()
    print("正在启动服务器...")
    print("访问地址: http://localhost:5000")
    print("按 Ctrl+C 停止服务")
    print()
    print("=" * 50)
    
    with HTTPServer(('', 5000), Handler) as server:
        print("✅ 服务器启动成功!")
        server.serve_forever()

except KeyboardInterrupt:
    print("\n\n服务器已停止")
except Exception as e:
    print(f"\n❌ 启动失败: {e}")
    input("\n按回车键退出...")
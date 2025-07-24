import http.server
import socketserver
import json
import urllib.parse

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"Request: {self.path}")
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if self.path == '/':
            data = {'message': 'Server is working!'}
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
            data = [
                {
                    "id": 1,
                    "textbook": {
                        "title": "高等数学教材",
                        "author": "张三",
                        "isbn": "9787111234567"
                    },
                    "seller": "李四",
                    "price": 25.0,
                    "condition": "8成新",
                    "description": "课本保存良好，无涂画",
                    "created_at": "2024-01-15T10:30:00"
                },
                {
                    "id": 2,
                    "textbook": {
                        "title": "数据结构与算法",
                        "author": "王五",
                        "isbn": "9787111234568"
                    },
                    "seller": "赵六",
                    "price": 35.0,
                    "condition": "9成新",
                    "description": "几乎全新，仅翻阅过几次",
                    "created_at": "2024-01-16T14:20:00"
                },
                {
                    "id": 3,
                    "textbook": {
                        "title": "线性代数",
                        "author": "陈七",
                        "isbn": "9787111234569"
                    },
                    "seller": "孙八",
                    "price": 20.0,
                    "condition": "7成新",
                    "description": "有少量笔记，不影响阅读",
                    "created_at": "2024-01-17T09:15:00"
                }
            ]
        else:
            data = {'error': 'Not found'}
        
        response = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.wfile.write(response)
    
    def do_POST(self):
        print(f"POST Request: {self.path}")
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
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
            data = {
                'qr_code': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTAiPuS6jOe7tOeggeWwseeUn+aIkDwvdGV4dD4KPC9zdmc+'
            }
        else:
            data = {'message': 'POST endpoint created', 'data': request_data}
        
        response = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.wfile.write(response)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = 5000
    print(f"Starting test server on port {PORT}")
    print(f"Access: http://localhost:{PORT}")
    
    try:
        with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
            print("Server started successfully!")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")
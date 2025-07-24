import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        if self.path == '/':
            response = {'message': 'Backend is running!', 'status': 'ok'}
        elif self.path == '/api/courses/tree':
            response = {
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
            response = [
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
                }
            ]
        else:
            response = {'error': 'Not found'}
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        if self.path == '/api/search_book_by_isbn':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            isbn = data.get('isbn', '')
            
            response = {
                'isbn': isbn,
                'title': f'示例教材-{isbn[-4:] if isbn else "0000"}',
                'author': '示例作者',
                'publisher': '示例出版社',
                'year': '2023'
            }
        elif self.path == '/api/generate_qr':
            response = {
                'qr_code': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
            }
        else:
            response = {'message': 'POST endpoint created'}
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    server = HTTPServer(('localhost', 5000), SimpleHandler)
    print("=====================================")
    print("  Minimal Backend Server Starting")
    print("=====================================")
    print("Server running at: http://localhost:5000")
    print("No external dependencies required!")
    print("Press Ctrl+C to stop")
    print("=====================================")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.shutdown()
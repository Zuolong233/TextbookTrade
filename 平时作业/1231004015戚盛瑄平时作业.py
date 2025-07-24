import tkinter as tk
from tkinter import messagebox
import numpy as np

class GomokuGame:
    def __init__(self, master):
        self.master = master
        self.master.title("五子棋游戏")
        self.master.geometry("800x600")
        self.master.configure(bg="#ff9d00")
        
        self.create_menu()
        
        self.board_size = 15
        self.cell_size = 35
        self.margin = 50
        self.board = np.zeros((self.board_size, self.board_size), dtype=int)
        self.current_player = 1
        self.game_started = False
        self.game_over = False
        
        self.colors = {
            'board': '#e8c87e',
            'line': '#000000',
            'black': '#000000',
            'white': '#FFFFFF',
            'highlight': '#ff0000'
        }
        
    def create_menu(self):
        """创建游戏主菜单"""
        self.menu_frame = tk.Frame(self.master, bg='#f0d9b5')
        self.menu_frame.pack(expand=True, fill=tk.BOTH)
        
        title = tk.Label(
            self.menu_frame, 
            text="五子棋游戏", 
            font=("楷体", 48, "bold"), 
            fg='#8b4513', 
            bg='#f0d9b5'
        )
        title.pack(pady=40)
        
        rules = tk.Label(
            self.menu_frame,
            text="游戏规则:\n1. 黑方使用鼠标左键下棋\n2. 白方使用鼠标右键下棋\n3. 五子连珠即可获胜\n4. 落子无悔",
            font=("宋体", 16),
            fg='#654321',
            bg='#f0d9b5',
            justify=tk.LEFT
        )
        rules.pack(pady=20)
        
        btn_frame = tk.Frame(self.menu_frame, bg='#f0d9b5')
        btn_frame.pack(pady=40)
        
        start_btn = tk.Button(
            btn_frame,
            text="开始游戏",
            font=("黑体", 20),
            bg='#8b4513',
            fg='white',
            width=12,
            height=2,
            command=self.start_game
        )
        start_btn.pack(side=tk.LEFT, padx=20)
        
        quit_btn = tk.Button(
            btn_frame,
            text="退出游戏",
            font=("黑体", 20),
            bg='#8b4513',
            fg='white',
            width=12,
            height=2,
            command=self.master.destroy
        )
        quit_btn.pack(side=tk.LEFT, padx=20)
        
    def start_game(self):
        """开始游戏"""
        self.menu_frame.pack_forget()
        self.game_started = True
        self.game_over = False
        self.board = np.zeros((self.board_size, self.board_size), dtype=int)
        self.current_player = 1
        
        canvas_width = self.margin * 2 + self.cell_size * (self.board_size - 1)
        canvas_height = canvas_width
        self.canvas = tk.Canvas(
            self.master, 
            width=canvas_width, 
            height=canvas_height,
            bg=self.colors['board']
        )
        self.canvas.pack(pady=20)
        self.canvas.bind("<Button-1>", self.left_click)
        self.canvas.bind("<Button-3>", self.right_click)
        self.draw_board()
        self.status_var = tk.StringVar()
        self.status_var.set("当前回合: 黑方 (使用鼠标左键)")
        self.status_label = tk.Label(
            self.master, 
            textvariable=self.status_var,
            font=("宋体", 16),
            fg='#8b4513',
            bg='#f0d9b5'
        )
        self.status_label.pack(pady=10)
        restart_btn = tk.Button(
            self.master,
            text="重新开始",
            font=("黑体", 14),
            bg='#8b4513',
            fg='white',
            width=10,
            command=self.restart_game
        )
        restart_btn.pack(pady=10)
        
    def draw_board(self):
        """绘制棋盘"""
        self.canvas.delete("all")
        for i in range(self.board_size):
            self.canvas.create_line(
                self.margin, 
                self.margin + i * self.cell_size,
                self.margin + (self.board_size - 1) * self.cell_size,
                self.margin + i * self.cell_size,
                fill=self.colors['line']
            )

            self.canvas.create_line(
                self.margin + i * self.cell_size,
                self.margin,
                self.margin + i * self.cell_size,
                self.margin + (self.board_size - 1) * self.cell_size,
                fill=self.colors['line']
            )
        
        star_points = [3, 7, 11]
        for x in star_points:
            for y in star_points:
                self.canvas.create_oval(
                    self.margin + x * self.cell_size - 4,
                    self.margin + y * self.cell_size - 4,
                    self.margin + x * self.cell_size + 4,
                    self.margin + y * self.cell_size + 4,
                    fill=self.colors['line']
                )
        
        for i in range(self.board_size):
            for j in range(self.board_size):
                if self.board[i][j] != 0:
                    self.draw_piece(i, j, self.board[i][j])
    
    def draw_piece(self, row, col, player):
        """绘制棋子"""
        x = self.margin + col * self.cell_size
        y = self.margin + row * self.cell_size
        radius = self.cell_size // 2 - 2
        
        if player == 1:  
            self.canvas.create_oval(
                x - radius, y - radius,
                x + radius, y + radius,
                fill=self.colors['black'],
                outline=self.colors['black']
            )
        else:  
            self.canvas.create_oval(
                x - radius, y - radius,
                x + radius, y + radius,
                fill=self.colors['white'],
                outline=self.colors['black']
            )
    
    def left_click(self, event):
        """处理鼠标左键点击事件（黑棋）"""
        if not self.game_started or self.game_over or self.current_player != 1:
            return
            
        col = round((event.x - self.margin) / self.cell_size)
        row = round((event.y - self.margin) / self.cell_size)
        
        if 0 <= row < self.board_size and 0 <= col < self.board_size:
            if self.board[row][col] == 0:
                self.board[row][col] = 1
                self.draw_piece(row, col, 1)
                if self.check_win(row, col, 1):
                    self.game_over = True
                    messagebox.showinfo("游戏结束", "黑方获胜！")
                else:
                    self.current_player = 2
                    self.status_var.set("当前回合: 白方 (使用鼠标右键)")
    
    def right_click(self, event):
        """处理鼠标右键点击事件（白棋）"""
        if not self.game_started or self.game_over or self.current_player != 2:
            return
            
        col = round((event.x - self.margin) / self.cell_size)
        row = round((event.y - self.margin) / self.cell_size)
        
        if 0 <= row < self.board_size and 0 <= col < self.board_size:
            if self.board[row][col] == 0:
                self.board[row][col] = 2
                self.draw_piece(row, col, 2)
                if self.check_win(row, col, 2):
                    self.game_over = True
                    messagebox.showinfo("游戏结束", "白方获胜！")
                else:
                    self.current_player = 1
                    self.status_var.set("当前回合: 黑方 (使用鼠标左键)")
    
    def check_win(self, row, col, player):
        """检查是否有五子连珠"""
        directions = [
            [(0, 1), (0, -1)],   
            [(1, 0), (-1, 0)],   
            [(1, 1), (-1, -1)],  
            [(1, -1), (-1, 1)]   
        ]
        
        for direction_pair in directions:
            count = 1  
            
            for dx, dy in direction_pair:
                temp_row, temp_col = row, col
                
                for _ in range(4):
                    temp_row += dx
                    temp_col += dy
                    
                    if (0 <= temp_row < self.board_size and 
                        0 <= temp_col < self.board_size and 
                        self.board[temp_row][temp_col] == player):
                        count += 1
                    else:
                        break
            
            if count >= 5:
                return True
        
        return False
    
    def restart_game(self):
        """重新开始"""
        self.board = np.zeros((self.board_size, self.board_size), dtype=int)
        self.current_player = 1
        self.game_over = False
        self.status_var.set("当前回合: 黑方 (使用鼠标左键)")
        self.draw_board()

if __name__ == "__main__":
    root = tk.Tk()
    game = GomokuGame(root)
    root.mainloop()
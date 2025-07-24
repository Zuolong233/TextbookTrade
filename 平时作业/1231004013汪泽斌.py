import tkinter as tk
from tkinter import messagebox


class GomokuGame:
    def __init__(self, root):
        self.root = root
        self.root.title("五子棋游戏")

        self.board_size = 15
        self.cell_size = 40
        self.margin = 30
        self.record = []  # 记录所有已下的棋子 (位置, 颜色)
        self.current_player = "black"  # 黑棋先行
        self.game_over = False

        self.create_menu()

    def create_menu(self):
        self.menu_frame = tk.Frame(self.root)
        self.menu_frame.pack(pady=100)

        tk.Label(self.menu_frame, text="五子棋游戏", font=("Arial", 24)).pack(pady=20)

        tk.Button(
            self.menu_frame,
            text="开始游戏",
            font=("Arial", 16),
            command=self.start_game
        ).pack(pady=10)

        tk.Button(
            self.menu_frame,
            text="退出游戏",
            font=("Arial", 16),
            command=self.root.quit
        ).pack(pady=10)

    def start_game(self):

        self.menu_frame.destroy()
        self.game_over = False
        self.current_player = "black"
        self.record = []


        canvas_width = self.margin * 2 + (self.board_size - 1) * self.cell_size
        canvas_height = self.margin * 2 + (self.board_size - 1) * self.cell_size
        self.canvas = tk.Canvas(
            self.root,
            width=canvas_width,
            height=canvas_height,
            bg="burlywood"
        )
        self.canvas.pack()

        self.draw_board()

        self.canvas.bind("<Button-1>", self.left_click)  # 左键下黑棋
        self.canvas.bind("<Button-3>", self.right_click)  # 右键下白棋

    def draw_board(self):
        for i in range(self.board_size):
            self.canvas.create_line(
                self.margin,
                self.margin + i * self.cell_size,
                self.margin + (self.board_size - 1) * self.cell_size,
                self.margin + i * self.cell_size
            )
            self.canvas.create_line(
                self.margin + i * self.cell_size,
                self.margin,
                self.margin + i * self.cell_size,
                self.margin + (self.board_size - 1) * self.cell_size
            )

        points = [(3, 3), (3, 11), (7, 7), (11, 3), (11, 11)]
        for x, y in points:
            self.canvas.create_oval(
                self.margin + x * self.cell_size - 4,
                self.margin + y * self.cell_size - 4,
                self.margin + x * self.cell_size + 4,
                self.margin + y * self.cell_size + 4,
                fill="black"
            )

    def left_click(self, event):
        if self.current_player == "black" and not self.game_over:
            self.place_piece(event.x, event.y, "black")

    def right_click(self, event):
        if self.current_player == "white" and not self.game_over:
            self.place_piece(event.x, event.y, "white")

    def place_piece(self, x, y, color):
        col = round((x - self.margin) / self.cell_size)
        row = round((y - self.margin) / self.cell_size)

        if col < 0 or col >= self.board_size or row < 0 or row >= self.board_size:
            return

        for pos, _ in self.record:
            if pos == (row, col):
                return

        self.record.append(((row, col), color))

        x_pos = self.margin + col * self.cell_size
        y_pos = self.margin + row * self.cell_size
        self.canvas.create_oval(
            x_pos - 15, y_pos - 15,
            x_pos + 15, y_pos + 15,
            fill=color,
            outline="black" if color == "white" else "white"
        )

        if self.check_win(row, col, color):
            self.game_over = True
            winner = "黑方" if color == "black" else "白方"
            messagebox.showinfo("游戏结束", f"{winner}获胜!")
            return

        self.current_player = "white" if color == "black" else "black"

    def check_win(self, row, col, color):
        directions = [
            (0, 1),
            (1, 0),
            (1, 1),
            (1, -1)
        ]

        for dr, dc in directions:
            count = 1

            r, c = row + dr, col + dc
            while 0 <= r < self.board_size and 0 <= c < self.board_size:
                if ((r, c), color) in self.record:
                    count += 1
                    r += dr
                    c += dc
                else:
                    break

            r, c = row - dr, col - dc
            while 0 <= r < self.board_size and 0 <= c < self.board_size:
                if ((r, c), color) in self.record:
                    count += 1
                    r -= dr
                    c -= dc
                else:
                    break

            if count >= 5:
                return True

        return False


if __name__ == "__main__":
    root = tk.Tk()
    game = GomokuGame(root)
    root.mainloop()
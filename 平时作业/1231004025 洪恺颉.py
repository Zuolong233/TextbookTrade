import tkinter as tk
from tkinter import messagebox


class GomokuGame:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("五子棋游戏")

        self.board_size = 15
        self.cell_size = 40
        self.record = []  #
        self.rec = []  # 总记录
        self.current_player = "black"

        self.create_start_ui()

    def create_start_ui(self):
        self.start_frame = tk.Frame(self.root)
        self.start_frame.pack()

        tk.Label(self.start_frame, text="五子棋游戏", font=("Arial", 20)).pack(pady=20)
        tk.Button(self.start_frame, text="开始游戏", command=self.start_game).pack(pady=10)
        tk.Button(self.start_frame, text="退出", command=self.root.quit).pack(pady=10)

    def start_game(self):
        self.start_frame.destroy()
        self.create_game_ui()

    def create_game_ui(self):
        self.canvas = tk.Canvas(self.root,
                                width=self.board_size * self.cell_size,
                                height=self.board_size * self.cell_size,
                                bg="burlywood")
        self.canvas.pack()

        self.draw_board()

        self.canvas.bind("<Button-1>", self.callback1)
        self.canvas.bind("<Button-3>", self.callback2)

    def draw_board(self):
        for i in range(self.board_size):
            self.canvas.create_line(self.cell_size, (i + 1) * self.cell_size,
                                    self.board_size * self.cell_size, (i + 1) * self.cell_size)
            self.canvas.create_line((i + 1) * self.cell_size, self.cell_size,
                                    (i + 1) * self.cell_size, self.board_size * self.cell_size)

    def callback1(self, event):
        if self.current_player == "black":
            self.place_stone(event.x, event.y, "black")

    def callback2(self, event):
        if self.current_player == "white":
            self.place_stone(event.x, event.y, "white")

    def place_stone(self, x, y, color):
        col = round((x - self.cell_size / 2) / self.cell_size)
        row = round((y - self.cell_size / 2) / self.cell_size)

        if 0 <= row < self.board_size and 0 <= col < self.board_size:
            stone_id = row * self.board_size + col + 1

            if stone_id not in self.rec:
                x_pos = (col + 1) * self.cell_size
                y_pos = (row + 1) * self.cell_size
                self.canvas.create_oval(x_pos - 15, y_pos - 15, x_pos + 15, y_pos + 15,
                                        fill=color, outline=color)

                self.record.append((row, col, color))
                self.rec.append(stone_id)

                if self.check_win(row, col, color):
                    messagebox.showinfo("游戏结束", f"{'黑方' if color == 'black' else '白方'}获胜!")
                    self.root.quit()
                else:
                    self.current_player = "white" if color == "black" else "black"

    def check_win(self, row, col, color):
        directions = [(0, 1), (1, 0), (1, 1), (1, -1)]

        for dr, dc in directions:
            count = 1

            r, c = row + dr, col + dc
            while 0 <= r < self.board_size and 0 <= c < self.board_size:
                if (r, c, color) in self.record:
                    count += 1
                    r += dr
                    c += dc
                else:
                    break

            r, c = row - dr, col - dc
            while 0 <= r < self.board_size and 0 <= c < self.board_size:
                if (r, c, color) in self.record:
                    count += 1
                    r -= dr
                    c -= dc
                else:
                    break

            if count >= 5:
                return True

        return False


if __name__ == "__main__":
    game = GomokuGame()
    game.root.mainloop()
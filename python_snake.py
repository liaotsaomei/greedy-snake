"""
水豚與貓咪貪食蛇 (Capybara & Cat Snake Game) - Python Tkinter 版
支援：貓咪/水豚雙風格切換、⭐星星加血食物 (+1生命)、👾惡魔小怪獸 (-1生命)
不需要額外安裝第三方庫，直接運行：python python_snake.py
"""

import tkinter as tk
import random

class CapybaraCatSnakeGame:
    def __init__(self, root):
        self.root = root
        self.root.title("🐱 貓咪 & 🦫 水豚貪食蛇 Master (Python 版)")
        self.root.resizable(False, False)

        # 遊戲參數
        self.GRID_SIZE = 20
        self.CELL_SIZE = 25
        self.WIDTH = self.GRID_SIZE * self.CELL_SIZE
        self.HEIGHT = self.GRID_SIZE * self.CELL_SIZE
        self.SPEED = 120  # 毫秒/步

        # 主題設定
        self.current_theme = "cat"  # "cat" 或 "capybara"
        self.themes = {
            "cat": {
                "name": "🐱 貓咪風格",
                "bg": "#1e151a",
                "grid": "#2b1c26",
                "head": "#ff85a1",
                "body": "#f72585",
                "food": "🐟",
                "text": "#fff0f5"
            },
            "capybara": {
                "name": "🦫 水豚風格",
                "bg": "#1e1915",
                "grid": "#281e18",
                "head": "#d4a373",
                "body": "#bc6c25",
                "food": "🍊",
                "text": "#fefae0"
            }
        }

        # 遊戲狀態
        self.score = 0
        self.high_score = 0
        self.lives = 3
        self.invulnerable_counter = 0
        self.running = False
        self.snake = []
        self.dir = (1, 0)
        self.next_dir = (1, 0)
        self.food = None
        self.star_food = None
        self.monster = None
        self.timer_id = None

        # 頂部分數與生命欄
        self.header_frame = tk.Frame(root, bg="#2b1c26")
        self.header_frame.pack(fill=tk.X)

        self.score_label = tk.Label(
            self.header_frame,
            text="生命: ❤️❤️❤️ | 分數: 0 | 最高: 0",
            font=("Microsoft JhengHei", 13, "bold"),
            fg="#ff85a1",
            bg="#2b1c26",
            pady=8
        )
        self.score_label.pack(side=tk.LEFT, padx=15)

        self.theme_btn = tk.Button(
            self.header_frame,
            text="🎨 切換主題: 🐱 貓咪",
            font=("Microsoft JhengHei", 10, "bold"),
            command=self.toggle_theme,
            bg="#4a253b",
            fg="#ffffff",
            activebackground="#f72585",
            bd=0,
            padx=10,
            pady=4,
            takefocus=False
        )
        self.theme_btn.pack(side=tk.RIGHT, padx=15)

        # 畫布
        self.canvas = tk.Canvas(
            root,
            width=self.WIDTH,
            height=self.HEIGHT,
            bg=self.themes[self.current_theme]["bg"],
            highlightthickness=0
        )
        self.canvas.pack()

        # 底部控制欄
        self.footer_frame = tk.Frame(root, bg=self.themes[self.current_theme]["bg"], pady=6)
        self.footer_frame.pack(fill=tk.X)

        self.restart_btn = tk.Button(
            self.footer_frame,
            text="🔄 重新開始 (Space)",
            font=("Microsoft JhengHei", 11, "bold"),
            command=self.reset_game,
            bg="#ff85a1",
            fg="#150f13",
            activebackground="#f72585",
            bd=0,
            padx=15,
            pady=4,
            takefocus=False
        )
        self.restart_btn.pack(side=tk.TOP, pady=2)

        self.info_label = tk.Label(
            self.footer_frame,
            text="⌨️ W/A/S/D 或 方向鍵移動 | ⭐星星+1命 | 👾怪獸-1命",
            font=("Microsoft JhengHei", 9),
            fg="#ff9ebb",
            bg=self.themes[self.current_theme]["bg"]
        )
        self.info_label.pack(side=tk.TOP)

        # 全域鍵盤事件綁定
        self.root.bind_all("<Key>", self.handle_keypress)

        # 啟動時直接開始遊戲
        self.reset_game()

    def toggle_theme(self):
        self.current_theme = "capybara" if self.current_theme == "cat" else "cat"
        t = self.themes[self.current_theme]
        self.theme_btn.config(text=f"🎨 切換主題: {t['name']}")
        self.score_label.config(fg=t["head"], bg=t["bg"])
        self.header_frame.config(bg=t["bg"])
        self.footer_frame.config(bg=t["bg"])
        self.canvas.config(bg=t["bg"])
        self.info_label.config(fg=t["head"], bg=t["bg"])
        self.restart_btn.config(bg=t["head"])
        if self.running:
            self.draw()

    def reset_game(self):
        if self.timer_id:
            self.root.after_cancel(self.timer_id)
            self.timer_id = None

        center = self.GRID_SIZE // 2
        self.snake = [(center, center), (center - 1, center), (center - 2, center)]
        self.dir = (1, 0)
        self.next_dir = (1, 0)
        self.score = 0
        self.lives = 3
        self.invulnerable_counter = 0
        self.star_food = None
        self.monster = None
        
        self.update_score_display()
        self.spawn_food()
        self.spawn_monster()
        self.running = True
        self.game_loop()

    def spawn_food(self):
        while True:
            x = random.randint(0, self.GRID_SIZE - 1)
            y = random.randint(0, self.GRID_SIZE - 1)
            if (x, y) not in self.snake:
                self.food = (x, y)
                break

    def spawn_monster(self):
        while True:
            mx = random.randint(0, self.GRID_SIZE - 1)
            my = random.randint(0, self.GRID_SIZE - 1)
            if (mx, my) not in self.snake and (mx, my) != self.food:
                self.monster = (mx, my)
                break

    def spawn_star_food(self):
        if self.lives >= 3:
            return
        while True:
            sx = random.randint(0, self.GRID_SIZE - 1)
            sy = random.randint(0, self.GRID_SIZE - 1)
            if (sx, sy) not in self.snake and (sx, sy) != self.food and (sx, sy) != self.monster:
                self.star_food = (sx, sy)
                break

    def handle_keypress(self, event):
        key = event.keysym.lower()

        if key in ["w", "up"] and self.dir != (0, 1):
            self.next_dir = (0, -1)
        elif key in ["s", "down"] and self.dir != (0, -1):
            self.next_dir = (0, 1)
        elif key in ["a", "left"] and self.dir != (1, 0):
            self.next_dir = (-1, 0)
        elif key in ["d", "right"] and self.dir != (-1, 0):
            self.next_dir = (1, 0)
        elif key in ["space", "return"]:
            self.reset_game()

    def update_score_display(self):
        if self.score > self.high_score:
            self.high_score = self.score
        hearts = "❤️" * max(0, self.lives) if self.lives > 0 else "💀"
        self.score_label.config(text=f"生命: {hearts} | 分數: {self.score} | 最高: {self.high_score}")

    def take_damage(self, reason="💥 受到傷害！"):
        if self.invulnerable_counter > 0:
            return
        self.lives -= 1
        self.invulnerable_counter = 10  # 幾步無敵時間
        self.update_score_display()
        if self.lives <= 0:
            self.game_over(reason)
        else:
            self.spawn_monster()

    def game_loop(self):
        if not self.running:
            return

        if self.invulnerable_counter > 0:
            self.invulnerable_counter -= 1

        self.dir = self.next_dir
        head_x, head_y = self.snake[0]
        dx, dy = self.dir
        new_head = (head_x + dx, head_y + dy)

        # 撞牆檢測
        if not (0 <= new_head[0] < self.GRID_SIZE and 0 <= new_head[1] < self.GRID_SIZE):
            self.take_damage("💥 撞牆扣 1 命！")
            if self.lives <= 0:
                return
            new_head = (self.GRID_SIZE // 2, self.GRID_SIZE // 2)

        # 撞自己檢測
        if new_head in self.snake:
            self.take_damage("💥 咬到自己扣 1 命！")
            if self.lives <= 0:
                return

        self.snake.insert(0, new_head)

        # 碰撞小怪獸 👾 (-1 命)
        if self.monster and new_head == self.monster:
            self.take_damage("👾 碰到小怪獸扣 1 命！")

        # 碰撞星星食物 ⭐ (+1 命，上限 3 命)
        if self.star_food and new_head == self.star_food:
            if self.lives < 3:
                self.lives += 1
            self.star_food = None
            self.update_score_display()

        # 吃到普通食物 (魚乾/橘子)
        if new_head == self.food:
            self.score += 10
            self.update_score_display()
            self.spawn_food()
            # 隨機刷出星星加血食物
            if not self.star_food and self.lives < 3 and random.random() < 0.35:
                self.spawn_star_food()
        else:
            self.snake.pop()

        # 小怪獸隨機漫步
        if self.monster and random.random() < 0.25:
            mx, my = self.monster
            dirs = [(1,0), (-1,0), (0,1), (0,-1)]
            mdx, mdy = random.choice(dirs)
            nmx = max(0, min(self.GRID_SIZE - 1, mx + mdx))
            nmy = max(0, min(self.GRID_SIZE - 1, my + mdy))
            if (nmx, nmy) not in self.snake and (nmx, nmy) != self.food:
                self.monster = (nmx, nmy)

        self.draw()
        self.timer_id = self.root.after(self.SPEED, self.game_loop)

    def draw(self):
        self.canvas.delete("all")
        t = self.themes[self.current_theme]

        # 畫背景網格
        for i in range(self.GRID_SIZE):
            self.canvas.create_line(i * self.CELL_SIZE, 0, i * self.CELL_SIZE, self.HEIGHT, fill=t["grid"])
            self.canvas.create_line(0, i * self.CELL_SIZE, self.WIDTH, i * self.CELL_SIZE, fill=t["grid"])

        # 畫普通食物 (🐟 / 🍊)
        if self.food:
            fx, fy = self.food
            self.canvas.create_text(
                fx * self.CELL_SIZE + self.CELL_SIZE / 2,
                fy * self.CELL_SIZE + self.CELL_SIZE / 2,
                text=t["food"],
                font=("Segoe UI Emoji", 14)
            )

        # 畫星星食物 ⭐
        if self.star_food:
            sx, sy = self.star_food
            self.canvas.create_text(
                sx * self.CELL_SIZE + self.CELL_SIZE / 2,
                sy * self.CELL_SIZE + self.CELL_SIZE / 2,
                text="⭐",
                font=("Segoe UI Emoji", 14)
            )

        # 畫小怪獸 👾
        if self.monster:
            mx, my = self.monster
            self.canvas.create_text(
                mx * self.CELL_SIZE + self.CELL_SIZE / 2,
                my * self.CELL_SIZE + self.CELL_SIZE / 2,
                text="👾",
                font=("Segoe UI Emoji", 14)
            )

        # 畫蛇
        for i, (sx, sy) in enumerate(self.snake):
            color = t["head"] if i == 0 else t["body"]
            self.canvas.create_rectangle(
                sx * self.CELL_SIZE + 2, sy * self.CELL_SIZE + 2,
                (sx + 1) * self.CELL_SIZE - 2, (sy + 1) * self.CELL_SIZE - 2,
                fill=color, outline=""
            )
            # 蛇頭標誌
            if i == 0:
                head_symbol = "🐱" if self.current_theme == "cat" else "🦫"
                self.canvas.create_text(
                    sx * self.CELL_SIZE + self.CELL_SIZE / 2,
                    sy * self.CELL_SIZE + self.CELL_SIZE / 2,
                    text=head_symbol,
                    font=("Segoe UI Emoji", 10)
                )

    def game_over(self, reason):
        self.running = False
        if self.timer_id:
            self.root.after_cancel(self.timer_id)
            self.timer_id = None
            
        t = self.themes[self.current_theme]
        self.canvas.create_rectangle(
            self.WIDTH // 6, self.HEIGHT // 3,
            self.WIDTH * 5 // 6, self.HEIGHT * 2 // 3,
            fill="#150f13", outline=t["head"], width=2
        )
        self.canvas.create_text(
            self.WIDTH // 2, self.HEIGHT // 2 - 20,
            text=f"GAME OVER\n{reason}",
            font=("Microsoft JhengHei", 16, "bold"),
            fill="#f72585",
            justify="center"
        )
        self.canvas.create_text(
            self.WIDTH // 2, self.HEIGHT // 2 + 30,
            text="按 [Space] 或點擊下方按鈕重新開始",
            font=("Microsoft JhengHei", 11),
            fill=t["text"],
            justify="center"
        )

if __name__ == "__main__":
    root = tk.Tk()
    app = CapybaraCatSnakeGame(root)
    root.mainloop()

import random
import time
import tkinter as tk
from tkinter import messagebox
import math

# NBA teams with colors (based on team colors)
nba_teams = [
    {"name": "Atlanta Hawks", "color": "#E03A3E"},
    {"name": "Boston Celtics", "color": "#007A33"},
    {"name": "Brooklyn Nets", "color": "#000000"},
    {"name": "Charlotte Hornets", "color": "#1D1160"},
    {"name": "Chicago Bulls", "color": "#CE1141"},
    {"name": "Cleveland Cavaliers", "color": "#860038"},
    {"name": "Dallas Mavericks", "color": "#00538C"},
    {"name": "Denver Nuggets", "color": "#0E2240"},
    {"name": "Detroit Pistons", "color": "#C8102E"},
    {"name": "Golden State Warriors", "color": "#1D428A"},
    {"name": "Houston Rockets", "color": "#CE1141"},
    {"name": "Indiana Pacers", "color": "#002D62"},
    {"name": "Los Angeles Clippers", "color": "#C8102E"},
    {"name": "Los Angeles Lakers", "color": "#552583"},
    {"name": "Memphis Grizzlies", "color": "#5D76A9"},
    {"name": "Miami Heat", "color": "#98002E"},
    {"name": "Milwaukee Bucks", "color": "#00471B"},
    {"name": "Minnesota Timberwolves", "color": "#0C2340"},
    {"name": "New Orleans Pelicans", "color": "#0C2340"},
    {"name": "New York Knicks", "color": "#006BB6"},
    {"name": "Oklahoma City Thunder", "color": "#007AC1"},
    {"name": "Orlando Magic", "color": "#0077C0"},
    {"name": "Philadelphia 76ers", "color": "#006BB6"},
    {"name": "Phoenix Suns", "color": "#1D1160"},
    {"name": "Portland Trail Blazers", "color": "#E03A3E"},
    {"name": "Sacramento Kings", "color": "#5A2D81"},
    {"name": "San Antonio Spurs", "color": "#C4CED4"},
    {"name": "Toronto Raptors", "color": "#CE1141"},
    {"name": "Utah Jazz", "color": "#002B5C"},
    {"name": "Washington Wizards", "color": "#002B5C"}
]

class NBATeamWheel:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("NBA Team Wheel - For George and Frankie!")
        self.root.geometry("600x700")
        self.root.configure(bg='#f0f0f0')
        
        # Create the main frame
        main_frame = tk.Frame(self.root, bg='#f0f0f0')
        main_frame.pack(expand=True, fill='both', padx=20, pady=20)
        
        # Title
        title_label = tk.Label(main_frame, text="NBA Team Wheel", 
                              font=('Arial', 24, 'bold'), 
                              bg='#f0f0f0', fg='#333')
        title_label.pack(pady=10)
        
        subtitle_label = tk.Label(main_frame, text="For George and Frankie!", 
                                 font=('Arial', 14), 
                                 bg='#f0f0f0', fg='#666')
        subtitle_label.pack(pady=5)
        
        # Canvas for the wheel
        self.canvas = tk.Canvas(main_frame, width=400, height=400, bg='white')
        self.canvas.pack(pady=20)
        
        # Result display
        self.result_label = tk.Label(main_frame, text="Click 'Spin the Wheel' to start!", 
                                    font=('Arial', 16, 'bold'), 
                                    bg='#f0f0f0', fg='#333')
        self.result_label.pack(pady=10)
        
        # Spin button
        self.spin_button = tk.Button(main_frame, text="🎯 SPIN THE WHEEL! 🎯", 
                                    font=('Arial', 16, 'bold'), 
                                    bg='#4CAF50', fg='white',
                                    command=self.spin_wheel,
                                    padx=20, pady=10)
        self.spin_button.pack(pady=20)
        
        # Draw the initial wheel
        self.draw_wheel()
        
    def draw_wheel(self):
        self.canvas.delete("all")
        center_x, center_y = 200, 200
        radius = 180
        
        # Calculate angle for each team
        angle_per_team = 360 / len(nba_teams)
        
        for i, team in enumerate(nba_teams):
            start_angle = i * angle_per_team
            end_angle = (i + 1) * angle_per_team
            
            # Draw the pie slice
            self.canvas.create_arc(center_x - radius, center_y - radius,
                                  center_x + radius, center_y + radius,
                                  start=start_angle, extent=angle_per_team,
                                  fill=team["color"], outline="white", width=2)
        
        # Draw center circle
        self.canvas.create_oval(center_x - 10, center_y - 10,
                               center_x + 10, center_y + 10,
                               fill="black", outline="white", width=2)
        
        # Draw pointer
        self.canvas.create_polygon(center_x, center_y - radius - 20,
                                  center_x - 10, center_y - radius - 5,
                                  center_x + 10, center_y - radius - 5,
                                  fill="red", outline="black", width=2)
    
    def spin_wheel(self):
        self.spin_button.config(state='disabled', text="Spinning...")
        self.result_label.config(text="🎯 Spinning the wheel... 🎯")
        
        # Simulate spinning animation
        for i in range(20):
            self.root.update()
            time.sleep(0.1)
            if i % 2 == 0:
                self.result_label.config(text="🎯 Spinning... 🎯")
            else:
                self.result_label.config(text="🎯 ... Spinning ... 🎯")
        
        # Select random team
        selected_team = random.choice(nba_teams)
        
        # Show result
        self.result_label.config(text=f"🏀 {selected_team['name']} 🏀", 
                                fg=selected_team['color'])
        
        # Show popup with result
        messagebox.showinfo("Result!", f"The wheel landed on:\n\n{selected_team['name']}!")
        
        # Re-enable button
        self.spin_button.config(state='normal', text="🎯 SPIN AGAIN! 🎯")
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    game = NBATeamWheel()
    game.run() 
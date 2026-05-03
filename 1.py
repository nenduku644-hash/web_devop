import tkinter as tk
import math

# =============================
# GLOBAL STATE
# =============================
ANGLE_MODE = "DEG"
MEMORY = 0
ANS = 0

# =============================
# CORE FUNCTIONS
# =============================
def angle(x):
    if ANGLE_MODE == "DEG":
        return math.radians(x)
    return x

def evaluate():
    global ANS
    try:
        expr = display.get()
        expr = expr.replace("π", str(math.pi))
        expr = expr.replace("e", str(math.e))
        result = eval(expr)
        ANS = result
        display.set(result)
    except:
        display.set("Math Error")

def press(val):
    display.set(display.get() + str(val))

def clear():
    display.set("")

def backspace():
    display.set(display.get()[:-1])

# =============================
# SCIENTIFIC OPS
# =============================
def sin(): display.set(math.sin(angle(float(display.get()))))
def cos(): display.set(math.cos(angle(float(display.get()))))
def tan(): display.set(math.tan(angle(float(display.get()))))
def log(): display.set(math.log10(float(display.get())))
def ln(): display.set(math.log(float(display.get())))
def sqrt(): display.set(math.sqrt(float(display.get())))
def square(): display.set(float(display.get()) ** 2)
def inverse(): display.set(1 / float(display.get()))
def factorial(): display.set(math.factorial(int(display.get())))

# =============================
# MEMORY OPS
# =============================
def mc():
    global MEMORY
    MEMORY = 0

def mr():
    display.set(MEMORY)

def m_plus():
    global MEMORY
    MEMORY += float(display.get())

def m_minus():
    global MEMORY
    MEMORY -= float(display.get())

def ans():
    display.set(ANS)

def toggle_angle():
    global ANGLE_MODE
    ANGLE_MODE = "RAD" if ANGLE_MODE == "DEG" else "DEG"
    mode_label.config(text=ANGLE_MODE)

# =============================
# UI
# =============================
root = tk.Tk()
root.title("Professional Scientific Calculator")
root.geometry("420x550")
root.resizable(False, False)

display = tk.StringVar()
tk.Entry(root, textvariable=display, font=("Consolas", 20),
         bd=10, relief=tk.RIDGE, justify="right").pack(fill="x", padx=10, pady=10)

mode_label = tk.Label(root, text="DEG", font=("Arial", 10))
mode_label.pack()

btns = tk.Frame(root)
btns.pack()

buttons = [
    ("7",7),("8",8),("9",9),("/", "/"),
    ("4",4),("5",5),("6",6),("*", "*"),
    ("1",1),("2",2),("3",3),("-", "-"),
    ("0",0),(".", "."),("=", "="),("+", "+")
]

r = c = 0
for t,v in buttons:
    if t == "=":
        cmd = evaluate
    else:
        cmd = lambda x=v: press(x)

    tk.Button(btns, text=t, width=7, height=2,
              font=("Arial",12), command=cmd).grid(row=r, column=c)
    c += 1
    if c == 4:
        c = 0
        r += 1

# =============================
# SCIENTIFIC BUTTONS
# =============================
ops = tk.Frame(root)
ops.pack(fill="x")

tk.Button(ops, text="sin", command=sin).pack(side="left", expand=True, fill="x")
tk.Button(ops, text="cos", command=cos).pack(side="left", expand=True, fill="x")
tk.Button(ops, text="tan", command=tan).pack(side="left", expand=True, fill="x")
tk.Button(ops, text="√", command=sqrt).pack(side="left", expand=True, fill="x")

tk.Button(ops, text="x²", command=square).pack(side="left", expand=True, fill="x")
tk.Button(ops, text="1/x", command=inverse).pack(side="left", expand=True, fill="x")
tk.Button(ops, text="log", command=log).pack(side="left", expand=True, fill="x")
tk.Button(ops, text="ln", command=ln).pack(side="left", expand=True, fill="x")

# =============================
# MEMORY & CONTROL
# =============================
mem = tk.Frame(root)
mem.pack(fill="x")

tk.Button(mem, text="MC", command=mc).pack(side="left", expand=True, fill="x")
tk.Button(mem, text="MR", command=mr).pack(side="left", expand=True, fill="x")
tk.Button(mem, text="M+", command=m_plus).pack(side="left", expand=True, fill="x")
tk.Button(mem, text="M-", command=m_minus).pack(side="left", expand=True, fill="x")
tk.Button(mem, text="ANS", command=ans).pack(side="left", expand=True, fill="x")

ctrl = tk.Frame(root)
ctrl.pack(fill="x")

tk.Button(ctrl, text="DEG/RAD", command=toggle_angle).pack(side="left", expand=True, fill="x")
tk.Button(ctrl, text="⌫", command=backspace).pack(side="left", expand=True, fill="x")
tk.Button(ctrl, text="AC", command=clear).pack(side="left", expand=True, fill="x")

root.mainloop()

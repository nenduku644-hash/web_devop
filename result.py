import pygame
import random
import sys

# ===================== CONFIG =====================
WIDTH, HEIGHT = 480, 720
FPS = 60

ROAD_WIDTH = 320
LANES = 3
LANE_WIDTH = ROAD_WIDTH // LANES

# Colors
GREEN = (40, 160, 40)
GRAY = (70, 70, 70)
WHITE = (230, 230, 230)
BLACK = (20, 20, 20)
RED = (200, 60, 60)
BLUE = (60, 140, 220)

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("City Driving")
clock = pygame.time.Clock()
font = pygame.font.SysFont("arial", 20)
big_font = pygame.font.SysFont("arial", 42)

road_x = WIDTH // 2 - ROAD_WIDTH // 2

# ===================== ROAD =====================
line_offset = 0
def draw_road(speed):
    global line_offset
    line_offset += speed
    if line_offset > 40:
        line_offset = 0

    pygame.draw.rect(screen, GRAY, (road_x, 0, ROAD_WIDTH, HEIGHT))

    for lane in range(1, LANES):
        for y in range(-40, HEIGHT, 40):
            pygame.draw.line(
                screen,
                WHITE,
                (road_x + lane * LANE_WIDTH, y + line_offset),
                (road_x + lane * LANE_WIDTH, y + 20 + line_offset),
                2
            )

# ===================== PLAYER =====================
class PlayerCar:
    def __init__(self):
        self.x = WIDTH // 2
        self.y = HEIGHT - 130
        self.width = 42
        self.height = 75
        self.speed = 0
        self.max_speed = 8
        self.steer_speed = 4

    @property
    def rect(self):
        return pygame.Rect(
            self.x - self.width // 2,
            self.y,
            self.width,
            self.height
        )

    def update(self, keys):
        # Speed control
        if keys[pygame.K_UP]:
            self.speed = min(self.max_speed, self.speed + 0.08)
        elif keys[pygame.K_DOWN]:
            self.speed = max(0, self.speed - 0.15)
        else:
            self.speed = max(0, self.speed - 0.04)

        # Steering
        if keys[pygame.K_LEFT]:
            self.x -= self.steer_speed
        if keys[pygame.K_RIGHT]:
            self.x += self.steer_speed

        # Road boundaries
        left_limit = road_x + 10
        right_limit = road_x + ROAD_WIDTH - self.width - 10
        self.x = max(left_limit + self.width//2, min(right_limit + self.width//2, self.x))

    def draw(self):
        pygame.draw.rect(screen, BLUE, self.rect)

# ===================== TRAFFIC =====================
class TrafficCar:
    def __init__(self):
        self.width = 42
        self.height = 75
        self.lane = random.randint(0, LANES - 1)
        self.x = road_x + self.lane * LANE_WIDTH + LANE_WIDTH // 2
        self.y = -120
        self.speed = random.uniform(2, 4)

    @property
    def rect(self):
        return pygame.Rect(
            self.x - self.width // 2,
            self.y,
            self.width,
            self.height
        )

    def update(self, player_speed):
        self.y += self.speed + player_speed * 0.6

    def draw(self):
        pygame.draw.rect(screen, RED, self.rect)

# ===================== GAME =====================
player = PlayerCar()
traffic = []
spawn_timer = 0
distance = 0
game_over = False

# ===================== LOOP =====================
while True:
    clock.tick(FPS)
    screen.fill(GREEN)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    keys = pygame.key.get_pressed()

    if not game_over:
        player.update(keys)
        draw_road(player.speed)

        spawn_timer += 1
        if spawn_timer > 100:
            traffic.append(TrafficCar())
            spawn_timer = 0

        for car in traffic[:]:
            car.update(player.speed)
            car.draw()

            if car.rect.top > HEIGHT:
                traffic.remove(car)

            if car.rect.colliderect(player.rect):
                game_over = True

        player.draw()

        distance += player.speed * 0.15

        # HUD
        screen.blit(font.render(f"Speed: {int(player.speed * 12)} km/h", True, WHITE), (10, 10))
        screen.blit(font.render(f"Distance: {int(distance)} m", True, WHITE), (10, 35))

    else:
        crash = big_font.render("CRASH!", True, RED)
        screen.blit(crash, crash.get_rect(center=(WIDTH//2, HEIGHT//2)))
        screen.blit(font.render("Press ESC to Exit", True, WHITE),
                    (WIDTH//2 - 80, HEIGHT//2 + 50))

        if keys[pygame.K_ESCAPE]:
            pygame.quit()
            sys.exit()

    pygame.display.update()

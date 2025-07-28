import numpy as np
import cv2
import matplotlib.pyplot as plt
from scipy import ndimage

class SeamCarver:
    def __init__(self, image_path: str):
        self.image = cv2.imread(image_path)
        if self.image is None:
            raise ValueError("Image not found or unable to read.")
        self.energy_map = self.compute_energy()
        self.seams = []
    
    def compute_energy(self):
        if len(self.image.shape) < 2:
            raise ValueError("Image must have at least two dimensions (height and width).")
        gray_image = cv2.cvtColor(self.image, cv2.COLOR_BGR2GRAY)
        dx = ndimage.sobel(gray_image, axis=1)
        dy = ndimage.sobel(gray_image, axis=0)
        self.energy_map = np.sqrt(dx**2 + dy**2) # Calculate the energy map as the gradient magnitude
        return self.energy_map
    
    def find_seam_greedy(self):
        rows, cols = self.energy_map.shape
        seam = np.zeros(rows, dtype=np.int)
        seam[0] = np.argmin(self.energy_map[0]) 
        cost = self.energy_map[0, seam[0]]
        for i in range(1, rows):
            prev_col = seam[i - 1]
            if prev_col == 0:
                seam[i] = np.argmin(self.energy_map[i, :2])
            elif prev_col == cols - 1:
                seam[i] = np.argmin(self.energy_map[i, -2:]) + (cols - 2)
            else:
                seam[i] = np.argmin(self.energy_map[i, prev_col - 1:prev_col + 2]) + (prev_col - 1)
            cost += self.energy_map[i, seam[i]]
        self.seams.append(seam)
        return seam, cost

    def find_seam_dp(self):
        rows, cols = self.energy_map.shape
        dp = np.zeros((rows, cols))
        backtrack = np.zeros((rows, cols), dtype=np.int)

        dp[0] = self.energy_map[0]
        for i in range(1, rows):
            for j in range(cols):
                if j == 0:
                    min_index = np.argmin(dp[i - 1, :2])
                    backtrack[i, j] = min_index
                    dp[i, j] = self.energy_map[i, j] + dp[i - 1, min_index]
                elif j == cols - 1:
                    min_index = np.argmin(dp[i - 1, -2:]) + (cols - 2)
                    backtrack[i, j] = min_index
                    dp[i, j] = self.energy_map[i, j] + dp[i - 1, min_index]
                else:
                    min_index = np.argmin(dp[i - 1, j - 1:j + 2]) + (j - 1)
                    backtrack[i, j] = min_index
                    dp[i, j] = self.energy_map[i, j] + dp[i - 1, min_index]

        seam = np.zeros(rows, dtype=np.int)
        seam[-1] = np.argmin(dp[-1])
        # Backtrack to find the seam
        for i in range(rows - 2, -1, -1):
            seam[i] = backtrack[i + 1, seam[i + 1]]
        
        self.seams.append(seam)
        return seam, dp[-1].min()
    
    def remove_seam(self, seam):
        rows, cols = self.image.shape[:2]
        new_image = np.zeros((rows, cols - 1, 3), dtype=self.image.dtype)
        for i in range(rows):
            col = seam[i]
            new_image[i, :col] = self.image[i, :col]
            new_image[i, col:] = self.image[i, col + 1:]
        self.image = new_image
        self.energy_map = self.compute_energy()
        return self.image
    
    def resize(self, new_width: int, new_height: int, algorithm: str = 'greedy'):
        if algorithm not in ['greedy', 'dp']:
            raise ValueError("Algorithm must be either 'greedy' or 'dp'.")
        
        current_height, current_width = self.image.shape[:2]
        if new_width > current_width or new_height > current_height:
            raise ValueError("New dimensions must be smaller than current dimensions.")
        
        while current_height > new_height or current_width > new_width:
            if algorithm == 'greedy':
                seam, _ = self.find_seam_greedy()
            else:
                seam, _ = self.find_seam_dp()
            self.remove_seam(seam)
            current_height, current_width = self.image.shape[:2]

        return self.image
    
    
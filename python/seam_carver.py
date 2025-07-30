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
        self.seams_map = self.image.copy() #FIXME
    
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
        seam = np.zeros(rows, dtype=int)
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
        return seam, cost

    def find_seam_dp(self):
        rows, cols = self.energy_map.shape
        dp = np.zeros((rows, cols))
        backtrack = np.zeros((rows, cols), dtype=int)

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

        seam = np.zeros(rows, dtype=int)
        seam[-1] = np.argmin(dp[-1])
        # Backtrack to find the seam
        for i in range(rows - 2, -1, -1):
            seam[i] = backtrack[i + 1, seam[i + 1]]
        
        return seam, dp[-1].min()
    
    def remove_seam(self, seam):
        rows, cols = self.image.shape[:2]
        # Color the seam
        for i in range(rows): #FIXME
            col = seam[i]
            self.seams_map[i, col] = [255, 0, 0]
        # Remove the seam from the image
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
        
        seam_number = 1
        while current_width > new_width:
            print(f"Removing seam {seam_number}: Current width {current_width}, Target width {new_width}")
            seam_number += 1
            if algorithm == 'greedy':
                seam, _ = self.find_seam_greedy()
            else:
                seam, _ = self.find_seam_dp()
            self.remove_seam(seam)
            current_height, current_width = self.image.shape[:2]
        
        seam_number = 1

        self.image = self.image.transpose((1, 0, 2))  # Transpose to work with height
        self.energy_map = self.compute_energy()
        self.seams_map = self.seams_map.transpose((1, 0, 2))
        #current_height, current_width = self.image.shape[:2]

        while current_height > new_height:
            print(f"Removing seam {seam_number}: Current height {current_height}, Target height {new_height}")
            seam_number += 1
            if algorithm == 'greedy':
                seam, _ = self.find_seam_greedy()
            else:
                seam, _ = self.find_seam_dp()
            self.remove_seam(seam)
            current_width, current_height = self.image.shape[:2]

        print(f"DONE: CURRENT HEIGHT: {current_height} WANTED HEIGHT: {new_height}")
        self.image = self.image.transpose((1, 0, 2))
        self.energy_map = self.compute_energy()
        self.seams_map = self.seams_map.transpose((1, 0, 2)) 
        return self.image
    
    def show_image(self, save: bool = False, filename: str = 'output.png'):
        plt.imshow(cv2.cvtColor(self.image, cv2.COLOR_BGR2RGB))
        plt.axis('off')
        if save:
            plt.savefig(filename, bbox_inches='tight', pad_inches=0)
        plt.show()
        return self.image
    
    def show_energy_map(self, save: bool = False, filename: str = 'energy_map.png'):
        plt.imshow(self.energy_map, cmap='hot')
        plt.colorbar()
        plt.axis('off')
        if save:
            plt.savefig(filename, bbox_inches='tight', pad_inches=0)
        plt.show()
        return self.energy_map
    
    def show_seams(self, save: bool = False, filename: str = 'seams.png'): #FIXME
        seam_image = self.seams_map.copy()
        plt.imshow(cv2.cvtColor(seam_image, cv2.COLOR_BGR2RGB))
        plt.axis('off')
        if save:
            plt.savefig(filename, bbox_inches='tight', pad_inches=0)
        plt.show()
        return seam_image
    
    
    def run(self, new_width: int, new_height: int, algorithm: str = 'greedy', save_image: bool = False, save_energy_map: bool = False, save_seams: bool = False):
        resized_image = self.resize(new_width, new_height, algorithm)
        self.show_image(save=save_image, filename='resized_image.png')
        self.show_energy_map(save=save_energy_map, filename='energy_map.png')
        self.show_seams(save=save_seams, filename='seams.png')
        return resized_image
    
import sys
#main function to run the seam carving process
if __name__ == "__main__":
    if len(sys.argv) >= 4:
        new_width = int(sys.argv[1])
        new_height = int(sys.argv[2])
        algorithm = sys.argv[3]
        try:
            seam_carver = SeamCarver('11999.jpg')
            seam_carver.run(new_width, new_height, algorithm, save_image=True, save_energy_map=True, save_seams=True)
            print("Seam carving completed.")
        except Exception as e:
            print("Error occurred during seam carving:", e)
    else:
        seam_carver = SeamCarver('11999.jpg')
        seam_carver.run(930, 1340, 'greedy', save_image=True, save_energy_map=True, save_seams=True)
        print("Seam carving completed with default parameters.")


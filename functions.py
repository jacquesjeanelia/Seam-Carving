import numpy as np
import cv2
import matplotlib.pyplot as plt
from scipy import ndimage

def greedy(energy):
    h, w = energy.shape
    total = 0
    path = np.zeros((h), dtype=int)
    path[0] = np.argmin(energy[0])
    total += energy[0, path[0]]
    for i in range(1, h):
        j = path[i - 1]
        if j == 0:
            if energy[i, j] < energy[i, j + 1]:
                path[i] = j
                total += energy[i, j]
            else:
                path[i] = j + 1
                total += energy[i, j + 1]
        elif j == w - 1:
            if energy[i, j] < energy[i, j - 1]:
                path[i] = j
                total += energy[i, j]
            else:
                path[i] = j - 1
                total += energy[i, j - 1]
        else:
            if energy[i,j] < energy[i,j-1] and energy[i,j] < energy[i,j+1]:
                path[i] = j
                total += energy[i, j]
            elif energy[i,j-1] < energy[i,j+1]:
                path[i] = j - 1
                total += energy[i, j - 1]
            else:
                path[i] = j + 1
                total += energy[i, j + 1]
    print("Total energy of the seam (greedy): ", total)
    return path

def getPath(path, start): # Get the seam path from the path array
    h, w = path.shape
    seam = np.zeros(h, dtype=int)
    seam[-1] = start
    
    # Ensure start is within bounds
    if start >= w:
        start = w - 1
    elif start < 0:
        start = 0
        
    for i in range(h-1, -1, -1):
        # Ensure index is within bounds before accessing
        if start < 1:
            start = 1  # Minimum valid value for start-1 to be 0
        elif start > w:
            start = w  # Maximum valid value
            
        seam[i] = path[i, start - 1]
        start = path[i, start - 1]
        
        # Ensure seam[i] is within bounds of the original image
        if seam[i] >= w:
            seam[i] = w - 1
        elif seam[i] < 0:
            seam[i] = 0
            
    return seam


def DP(energy):
    h, w = energy.shape
    dp = np.full((h, w+2), np.inf)
    path = np.zeros((h, w), dtype=int) 
    dp[0, 1:w+1] = energy[0] # Base case for the first row, shifted by 1 to account for padding
    for i in range (1, h): 
        for j in range(1, w+1):
            dp[i,j] = min(dp[i-1,j-1], dp[i-1,j], dp[i-1,j+1]) # DP update rule
            if dp[i,j] == dp[i-1,j-1]: # Fill the path array with indices of the seam
                path[i,j-1] = j-1
            elif dp[i,j-1] == dp[i-1,j]:
                path[i,j-1] = j
            else:
                path[i,j-1] = j+1
            dp[i,j] += energy[i,j-1]
    start = np.argmin(dp[-1, 1:w+1]) # Find the index of the minimum energy in the last row (the seam start)
    seam = getPath(path, start) # Get the seam path from the path array
    

    # Add bounds checking when calculating total energy
    total = 0
    for i in range(h):
        # Ensure seam[i] is within bounds
        if seam[i] >= w:
            seam[i] = w - 1
        elif seam[i] < 0:
            seam[i] = 0
        total += energy[i, seam[i]]
    
    print("Total energy of the seam (DP): ", total)
    return seam


def compute_Sobel_energy(img): # Compute energy map using gradient magnitude
    
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img
    
    # Compute x and y gradients 
    dx = ndimage.sobel(gray, axis=1)
    dy = ndimage.sobel(gray, axis=0)

    # Compute gradient magnitude
    energy = np.sqrt(dx**2 + dy**2)
    
    return energy

def apply_grabcut(img): # Apply grabCut to segment the foreground from the background
    mask = np.zeros(img.shape[:2], np.uint8) # Create a mask to avoid negative values
    bgdModel = np.zeros((1,65), np.float64) # Background model for grabCut
    fgdModel = np.zeros((1,65), np.float64) # Foreground model for grabCut

    # Define rectangle around center of the image
    height, width = img.shape[:2]
    rect = (width // 4, height // 4, width // 2, height // 2) # Avoid edges

    cv2.grabCut(img, mask, rect, bgdModel, fgdModel, 5, cv2.GC_INIT_WITH_RECT) # Apply grabCut to segment the foreground

    binary_mask = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8') # Create a binary mask for the foreground
    return binary_mask 

def compute_content_aware_energy(img):
    sobel = compute_Sobel_energy(img)
    mask = apply_grabcut(img) # Apply grabCut to get the foreground mask

    sobel[mask == 1] *= 10 # Increase energy in the foreground region to protect it

    return sobel
    

def remove_seam(img, seam):
    """Remove a seam from the image"""
    h, w = img.shape[:2] 
    output = np.zeros((h, w-1, 3) if len(img.shape) == 3 else (h, w-1), dtype=img.dtype) 
    
    for i in range(h): 
        col = seam[i] 
        if len(img.shape) == 3: 
            output[i, :col] = img[i, :col]
            output[i, col:] = img[i, col+1:]
        else:
            output[i, :col] = img[i, :col]
            output[i, col:] = img[i, col+1:]
    
    return output

def visualize_seam(img, seam):
    """Visualize the seam on the image"""
    vis_img = img.copy()
    h = img.shape[0]
    
    # Draw the seam in red
    for i in range(h):
        if len(img.shape) == 3:
            vis_img[i, seam[i]] = [0, 0, 255]  # Red in BGR
        else:
            vis_img[i, seam[i]] = 255
    
    return vis_img

def visualize_seams_accumulate(img, seams_vertical, seams_horizontal):
    """Visualize multiple seams accumulated on the image"""
    vis_img = img.copy()
    h, w = img.shape[:2]
    
    # Create a mask to accumulate seams
    if len(img.shape) == 3:
        mask = np.zeros((h, w), dtype=bool)
    else:
        mask = np.zeros_like(vis_img, dtype=bool)
    
    # Mark all seam pixels in the mask
    for seam in seams_vertical:
        for i in range(h):
            if 0 <= seam[i] < w:  # Ensure index is within bounds
                mask[i, seam[i]] = True
    
    for seam in seams_horizontal:
        for i in range(len(seam)):
            if i < w and 0 <= seam[i] < h:  # Ensure index is within bounds
                mask[seam[i], i] = True
    
    # Color the seam pixels in red (for color images) or white (for grayscale)
    if len(img.shape) == 3:
        for i in range(h):
            for j in range(w):
                if mask[i, j]:
                    vis_img[i, j] = [0, 0, 255]  # Red in BGR format
    else:
        vis_img[mask] = 255
    
    return vis_img


def compare_seam_carving(img_path, width=1, height=1):
    # Load image
    img = cv2.imread(img_path)
    if img is None:
        print(f"Could not load image from {img_path}")
        return
    
    # Create copies for each algorithm
    img_greedy = img.copy()
    img_dp = img.copy()
    original_img = img.copy()  # Keep a copy of the original
    
    # Store all seams
    all_greedy_seams_vertical = []
    all_dp_seams_vertical = []
    all_greedy_seams_horizontal = []
    all_dp_seams_horizontal = []
    
    # Process the image with both algorithms
    energy_greedy = compute_content_aware_energy(img_greedy)
    seam_greedy = DP(energy_greedy)
    all_greedy_seams_vertical.append(seam_greedy.copy())

    energy_dp = compute_Sobel_energy(img_dp)
    seam_dp = DP(energy_dp)
    all_dp_seams_vertical.append(seam_dp.copy())

    for i in range(width - 1):
        print(f"\nRemoving seam {i+1}/{width} vertically")
        
        # Greedy algorithm
        energy_greedy = compute_Sobel_energy(img_greedy)
        seam_greedy = DP(energy_greedy)
        all_greedy_seams_vertical.append(seam_greedy.copy())

        energy_dp = compute_Sobel_energy(img_dp)
        seam_dp = DP(energy_dp)
        all_dp_seams_vertical.append(seam_dp.copy())
        
        
        # DP algorithm
        #energy_dp = compute_Sobel_energy(img_dp)
        #seam_dp = DP(energy_dp)
        #all_dp_seams_vertical.append(seam_dp.copy())
        
        # Remove seams
        img_greedy = remove_seam(img_greedy, seam_greedy)
        img_dp = remove_seam(img_dp, seam_dp)
    
    #transpose img_greedy and img_dp to do horizontal seam carving
    if(height > 0):
        img_greedy = cv2.transpose(img_greedy)
        img_dp = cv2.transpose(img_dp)

    for i in range(height):
        print(f"\nRemoving seam {i+1} /{height} horizontally")
        
        # Greedy algorithm
        energy_greedy = compute_Sobel_energy(img_greedy)
        seam_greedy = DP(energy_greedy)
        all_greedy_seams_horizontal.append(seam_greedy.copy())

        energy_dp = compute_Sobel_energy(img_dp)
        seam_dp = DP(energy_dp)
        all_dp_seams_horizontal.append(seam_dp.copy())
        
        # DP algorithm
        #energy_dp = compute_Sobel_energy(img_dp)
        #seam_dp = DP(energy_dp)
        #all_dp_seams_horizontal.append(seam_dp.copy())
        
        # Remove seams
        img_greedy = remove_seam(img_greedy, seam_greedy)
        img_dp = remove_seam(img_dp, seam_dp)
        
    # Transpose back to original orientation    
    img_greedy = cv2.transpose(img_greedy)
    img_dp = cv2.transpose(img_dp)

    # Setup visualization
    plt.figure(figsize=(15, 10))
    
    # Show original image
    plt.subplot(2, 2, 1)
    plt.imshow(cv2.cvtColor(original_img, cv2.COLOR_BGR2RGB))
    plt.title('Original Image')
    plt.axis('off')
    
    # Show all greedy seams accumulated
    greedy_seams_vis = visualize_seams_accumulate(original_img, all_greedy_seams_vertical, all_greedy_seams_horizontal)
    plt.subplot(2, 2, 2)
    plt.imshow(cv2.cvtColor(greedy_seams_vis, cv2.COLOR_BGR2RGB))
    plt.title('All Greedy Seams')
    plt.axis('off')
    
    # Show all DP seams accumulated
    dp_seams_vis = visualize_seams_accumulate(original_img, all_dp_seams_vertical ,all_dp_seams_horizontal)
    plt.subplot(2, 2, 3)
    plt.imshow(cv2.cvtColor(dp_seams_vis, cv2.COLOR_BGR2RGB))
    plt.title('All DP Seams')
    plt.axis('off')
    
    # Show comparison of final results
    plt.subplot(2, 2, 4)
    # Create a side-by-side comparison
    comparison = np.hstack((img_greedy, img_dp))
    plt.imshow(cv2.cvtColor(comparison, cv2.COLOR_BGR2RGB))
    plt.title('Results: Greedy (Left) vs DP (Right)')
    plt.axis('off')
    
    plt.tight_layout()
    plt.show()
    
    return img_greedy, img_dp, greedy_seams_vis, dp_seams_vis


def seam_carving_tool():
    """Interactive tool for seam carving"""
    # Get image path
    img_path = input("Enter the path to the image: ")
    
    # Get number of seams to remove
    try:
        width = int(input("Enter number of seams to remove vertically: "))
        height = int(input("Enter number of seams to remove horizontally: "))
    except ValueError:
        print("Invalid number. Using 1 seam.")
        width = 1
        height = 1
    
    # Compare algorithms
    result = compare_seam_carving(img_path, width, height)
    
    # Unpack the results (handling both return value patterns)
    if len(result) == 4:
        img_greedy, img_dp, greedy_seams_vis, dp_seams_vis = result
    else:
        img_greedy, img_dp = result
    
    # Save results if requested
    save_option = input("Do you want to save the results? (y/n): ").lower()
    if save_option == 'y':
        greedy_path = input("Enter path to save the greedy result: ")
        dp_path = input("Enter path to save the DP result: ")
        
        if greedy_path:
            cv2.imwrite(greedy_path, img_greedy)
            print(f"Greedy result saved to {greedy_path}")
        
        if dp_path:
            cv2.imwrite(dp_path, img_dp)
            print(f"DP result saved to {dp_path}")

if __name__ == "__main__":
    seam_carving_tool()
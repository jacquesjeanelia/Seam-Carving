from seam_carver import SeamCarver
import sys
import os

def main():
    if len(sys.argv) != 5:
        print(f"Expected 5 arguments, got {len(sys.argv)}")
        return
    image_path = sys.argv[1]
    width = int(sys.argv[2])
    height = int(sys.argv[3])
    algorithm = sys.argv[4]



    try:
        seam_carver = SeamCarver(image_path)
        seam_carver.resize(width, height, algorithm)
        
        # Handle output directories and file paths
        filename = os.path.splitext(os.path.basename(image_path))[0]
        
        # Use os.path.join for proper path handling
        processed_images_dir = os.path.join('public', 'outputs', 'processed-images')
        energy_maps_dir = os.path.join('public', 'outputs', 'energy-maps')
        seam_visualization_dir = os.path.join('public', 'outputs', 'seam-visualization')
        
        # Create directories if they don't exist
        os.makedirs(processed_images_dir, exist_ok=True)
        os.makedirs(energy_maps_dir, exist_ok=True)
        os.makedirs(seam_visualization_dir, exist_ok=True)
        
        # Save the outputs
        seam_carver.save_image(os.path.join(processed_images_dir, f'{filename}_resized_image.png'))
        seam_carver.save_energy_map(os.path.join(energy_maps_dir, f'{filename}_energy_map.png'))
        seam_carver.save_seams(os.path.join(seam_visualization_dir, f'{filename}_seams.png'))
        
        print("Seam carving completed.")
    except Exception as e:
        print("Error occurred during seam carving:", e)
    
if __name__ == "__main__":
    main()

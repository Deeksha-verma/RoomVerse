import sys
import os
import random

def create_cube(name, x, y, z, width, height, depth):
    """
    Returns vertices and faces for a cube.
    """
    w = width / 2
    h = height
    d = depth / 2
    
    # Vertices relative to center (x, z) and bottom (y)
    vertices = [
        (x - w, y, z - d),      # 0: bottom-left-front
        (x + w, y, z - d),      # 1: bottom-right-front
        (x + w, y + h, z - d),  # 2: top-right-front
        (x - w, y + h, z - d),  # 3: top-left-front
        (x - w, y, z + d),      # 4: bottom-left-back
        (x + w, y, z + d),      # 5: bottom-right-back
        (x + w, y + h, z + d),  # 6: top-right-back
        (x - w, y + h, z + d),  # 7: top-left-back
    ]
    
    # Faces (1-indexed for OBJ, but we'll adjust offset later)
    # OBJ faces are counter-clockwise
    faces = [
        (0, 1, 2, 3), # Front
        (5, 4, 7, 6), # Back
        (4, 0, 3, 7), # Left
        (1, 5, 6, 2), # Right
        (3, 2, 6, 7), # Top
        (4, 5, 1, 0), # Bottom
    ]
    
    return vertices, faces

def generate_room_obj(output_path):
    """
    Generates an OBJ file with multiple named objects.
    """
    objects = []
    
    # Floor
    objects.append({"name": "Floor", "dims": (0, 0, 0, 10, 0.1, 10)})
    
    # Walls
    objects.append({"name": "Wall_North", "dims": (0, 0, -5, 10, 3, 0.2)})
    objects.append({"name": "Wall_East", "dims": (5, 0, 0, 0.2, 3, 10)})
    
    # Furniture (Randomized slightly)
    bed_x = random.uniform(-3, -1)
    bed_z = random.uniform(-3, -1)
    objects.append({"name": "King_Size_Bed", "dims": (bed_x, 0, bed_z, 2, 0.6, 2.2)})
    
    table_x = random.uniform(2, 4)
    table_z = random.uniform(2, 4)
    objects.append({"name": "Study_Desk", "dims": (table_x, 0, table_z, 1.5, 0.8, 0.8)})
    
    wardrobe_x = random.uniform(-4, -3)
    wardrobe_z = random.uniform(2, 4)
    objects.append({"name": "Wardrobe", "dims": (wardrobe_x, 0, wardrobe_z, 1.2, 2.5, 0.8)})

    with open(output_path, 'w') as f:
        f.write("# Generated Room Model\n")
        
        vertex_offset = 1
        
        for obj in objects:
            name = obj["name"]
            x, y, z, w, h, d = obj["dims"]
            
            f.write(f"o {name}\n")
            
            vertices, faces = create_cube(name, x, y, z, w, h, d)
            
            for v in vertices:
                f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
            
            for face in faces:
                # OBJ indices are 1-based
                f_str = " ".join([str(idx + vertex_offset) for idx in face])
                f.write(f"f {f_str}\n")
            
            vertex_offset += len(vertices)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_images.py <output_path>")
        sys.exit(1)
        
    output_file = sys.argv[1]
    generate_room_obj(output_file)
    print(f"Generated model at {output_file}")

"""Remove white background from logo, save as transparent PNG."""
from PIL import Image

src = r"d:\tracex\TraceX-main\frontend\public\anveshak-logo.png"
dst = r"d:\tracex\TraceX-main\frontend\public\anveshak-logo.png"

img = Image.open(src).convert("RGBA")
w, h = img.size
print(f"Input: {w}x{h}, {img.mode}")

data = img.getdata()
new_data = []
threshold = 235  # pixels above this in all RGB channels become transparent

for r, g, b, a in data:
    if r >= threshold and g >= threshold and b >= threshold:
        # Fully transparent for near-white pixels
        new_data.append((r, g, b, 0))
    elif r >= 210 and g >= 210 and b >= 210:
        # Semi-transparent for light gray edges (anti-aliasing smoothing)
        # Scale alpha based on brightness
        brightness = (r + g + b) / 3
        alpha = max(0, int(255 * (1 - (brightness - 210) / 25)))
        new_data.append((r, g, b, alpha))
    else:
        new_data.append((r, g, b, a))

img.putdata(new_data)
img.save(dst, "PNG")
print(f"Saved transparent logo: {dst}")
print(f"File size: {img.size}")

import argparse
import base64
import io
import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps
from pillow_heif import register_heif_opener


register_heif_opener()


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--library", required=True)
    parser.add_argument("--plan", required=True)
    parser.add_argument("--out", required=True)
    return parser.parse_args()


def aspect_for(width, height):
    ratio = width / height
    choices = {
        "1/1": 1.0,
        "4/5": 0.8,
        "3/4": 0.75,
        "2/3": 2 / 3,
        "16/9": 16 / 9,
        "21/9": 21 / 9,
    }
    return min(choices, key=lambda key: abs(choices[key] - ratio))


def blur_data_url(image):
    preview = image.copy()
    preview.thumbnail((20, 20), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    preview.save(buffer, format="JPEG", quality=42, optimize=True)
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/jpeg;base64,{encoded}"


def export_image(source, destination):
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        image = ImageOps.autocontrast(image, cutoff=0.35)
        image = ImageEnhance.Contrast(image).enhance(1.035)
        image = ImageEnhance.Color(image).enhance(1.025)
        image = ImageEnhance.Sharpness(image).enhance(1.08)
        image.thumbnail((2400, 2400), Image.Resampling.LANCZOS)
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, format="WEBP", quality=86, method=6)
        return {
            "width": image.width,
            "height": image.height,
            "aspect": aspect_for(image.width, image.height),
            "blurDataUrl": blur_data_url(image),
        }


def main():
    args = parse_args()
    library = Path(args.library)
    output_root = Path(args.out)
    plan = json.loads(Path(args.plan).read_text(encoding="utf-8"))
    exported = []

    for collection in plan["collections"]:
        for item in collection["items"]:
            info_dir = library / "images" / f"{item['eagleId']}.info"
            metadata = json.loads(
                (info_dir / "metadata.json").read_text(encoding="utf-8")
            )
            source = info_dir / f"{metadata['name']}.{metadata['ext']}"
            if not source.exists():
                raise FileNotFoundError(source)
            destination = output_root / collection["slug"] / f"{item['slug']}.webp"
            image_data = export_image(source, destination)
            exported.append(
                {
                    "collectionSlug": collection["slug"],
                    "eagleId": item["eagleId"],
                    "sourceName": metadata["name"],
                    "capturedAt": (
                        None
                        if metadata.get("btime") is None
                        else __import__("datetime")
                        .datetime.fromtimestamp(
                            metadata["btime"] / 1000,
                            tz=__import__("datetime").timezone.utc,
                        )
                        .date()
                        .isoformat()
                    ),
                    "outputPath": str(destination.resolve()),
                    **image_data,
                }
            )
            print(destination)

    manifest = output_root / "manifest.json"
    manifest.write_text(json.dumps(exported, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {manifest}")


if __name__ == "__main__":
    main()

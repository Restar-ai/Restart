"""
Download the sentence-transformers embedding model for RAG.
Run this once before starting the AI service.

    python download_model.py
"""

import os
import time
import requests

BASE_URL = "https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2/resolve/main/"
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models", "paraphrase-multilingual-MiniLM-L12-v2")
POOLING_DIR = os.path.join(MODEL_DIR, "1_Pooling")

FILES = [
    "config.json",
    "tokenizer_config.json",
    "tokenizer.json",
    "special_tokens_map.json",
    "sentence_bert_config.json",
    "modules.json",
    "pytorch_model.bin",
]
POOLING_FILES = ["config.json"]


def download_file(url, dest_path):
    existing = os.path.getsize(dest_path) if os.path.exists(dest_path) else 0

    for attempt in range(1, 11):
        try:
            headers = {"Range": f"bytes={existing}-"} if existing > 0 else {}
            r = requests.get(url, headers=headers, stream=True, timeout=60)

            raw_len = r.headers.get("Content-Range", "").split("/")[-1]
            total = int(raw_len) if raw_len.isdigit() else int(r.headers.get("Content-Length", 0))

            mode = "ab" if existing > 0 else "wb"
            with open(dest_path, mode) as f:
                for chunk in r.iter_content(chunk_size=512 * 1024):
                    f.write(chunk)
                    existing += len(chunk)
                    if total:
                        pct = existing / total * 100
                        print(f"\r  {pct:5.1f}%  {existing // (1024*1024)}/{total // (1024*1024)} MB", end="", flush=True)

            print()
            return

        except Exception as exc:
            print(f"\n  Attempt {attempt} failed: {exc}")
            if attempt < 10:
                print("  Retrying in 5 s...")
                time.sleep(5)
            else:
                raise RuntimeError(f"Failed to download {url}") from exc


def main():
    os.makedirs(MODEL_DIR, exist_ok=True)
    os.makedirs(POOLING_DIR, exist_ok=True)

    print("Downloading sentence-transformers embedding model (~449 MB)")
    print("This runs once. The model is saved locally and not re-downloaded.\n")

    for fname in FILES:
        dest = os.path.join(MODEL_DIR, fname)
        size = os.path.getsize(dest) if os.path.exists(dest) else 0
        total_expected = 470_693_617 if fname == "pytorch_model.bin" else 0

        if total_expected and size >= total_expected:
            print(f"  {fname} — already complete, skipping")
            continue

        print(f"  {fname}")
        download_file(BASE_URL + fname, dest)

    for fname in POOLING_FILES:
        dest = os.path.join(POOLING_DIR, fname)
        if os.path.exists(dest) and os.path.getsize(dest) > 0:
            print(f"  1_Pooling/{fname} — already complete, skipping")
            continue
        print(f"  1_Pooling/{fname}")
        download_file(BASE_URL + "1_Pooling/" + fname, dest)

    print("\nModel download complete.")
    print(f"Saved to: {MODEL_DIR}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Download real flag SVGs from Wikimedia Commons.

Run from the flags.fyi repo root:
    python3 fetch-wiki-svgs.py

Requires: Python 3.7+ (no pip dependencies)
"""

import os, time, urllib.request, urllib.error, urllib.parse, json

# Wikimedia Commons Special:FilePath auto-redirects to the actual file
BASE = "https://commons.wikimedia.org/wiki/Special:FilePath/"

# flag_id -> (wikimedia_filename, local_path_relative_to_repo)
# All filenames verified to exist on Wikimedia Commons as of March 2026
DOWNLOADS = {
    # ── Empty — all flags downloaded. Add new entries here as needed. ──
}

def download(wiki_file, local_path):
    url = BASE + urllib.parse.quote(wiki_file.replace(' ', '_'), safe='()')
    req = urllib.request.Request(url, headers={
        'User-Agent': 'flags.fyi/1.0 (https://flags.fyi; nafsadh@gmail.com) Python/3'
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read()
        if b'<svg' not in data.lower() and b'<?xml' not in data[:500]:
            raise ValueError(f'Response is not SVG ({len(data)} bytes)')
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, 'wb') as f:
            f.write(data)
        return len(data)

def main():
    ok, fail, skip = 0, 0, 0
    total = len(DOWNLOADS)
    print(f"Downloading {total} flag SVGs from Wikimedia Commons...\n")

    for i, (flag_id, (wiki_file, local_path)) in enumerate(sorted(DOWNLOADS.items()), 1):
        try:
            size = download(wiki_file, local_path)
            print(f"  [{i:3d}/{total}] OK  {flag_id} ({size:,d} bytes)")
            ok += 1
        except Exception as e:
            print(f"  [{i:3d}/{total}] FAIL {flag_id}: {e}")
            fail += 1
        time.sleep(0.2)  # be polite to Wikimedia

    print(f"\nDone: {ok} downloaded, {fail} failed, {total} total")
    print(f"Now run: node build.js")

if __name__ == '__main__':
    main()

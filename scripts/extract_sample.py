import csv, json, random, pathlib

CSV_PATH = pathlib.Path("spotify_songs.csv")
OUT_PATH = pathlib.Path("src/data/tracks.json")         
N = 200                                                 
RANDOM_SEED = 42

KEEP_COLS = [
    "track_id",
    "track_name",
    "track_artist",
    "playlist_genre",
    "danceability",
]

random.seed(RANDOM_SEED)

rows = []
with CSV_PATH.open(newline="", encoding="utf-8") as f:
    reader = list(csv.DictReader(f))
    sample = random.sample(reader, k=min(N, len(reader)))
    for r in sample:
        # keep only selected keys; cast numeric if possible
        filtered = {k: r.get(k) for k in KEEP_COLS}
        # numeric cleanup
        try:
            filtered["danceability"] = float(filtered["danceability"]) if filtered["danceability"] else None
        except ValueError:
            filtered["danceability"] = None
        rows.append(filtered)

OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
with OUT_PATH.open("w", encoding="utf-8") as out:
    json.dump(rows, out, indent=2)

print(f"Wrote {len(rows)} records to {OUT_PATH}")

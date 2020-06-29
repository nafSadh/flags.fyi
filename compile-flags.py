import json

with open('static/flags.json') as flags_json_file:
    flags_json = json.load(flags_json_file)

    flags_meta = {}

    ids = list(flags_json)
    n = len(ids)

    for i in range(n):
        flags_meta[ids[i]] = {
            'prev': ids[i-1],
            'next': ids[(i+1) % n],
        }

    with open('assets/flags/meta.json', 'w') as flags_meta_file:
        json.dump(flags_meta,  flags_meta_file, indent=2)

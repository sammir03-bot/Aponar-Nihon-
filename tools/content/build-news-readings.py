#!/usr/bin/env python3
"""Build a compact reading lexicon from pinned open IPADIC data."""
import argparse
import gzip
import hashlib
import re
import struct
import tarfile
import tempfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
URL = 'https://registry.npmjs.org/kuromoji/-/kuromoji-0.1.2.tgz'
PACKAGE_SHA = 'ccf8778839df92ae3a3d64a93998ac92d1e92c7f73fe6193295a5258c98308b4'
TABLE_SHA = '7985075cafbd7fbfc43808c7491787661a868312e96825b827f008acfa48b8d3'
OUTPUT = ROOT / 'assets/data/news-readings.tsv.gz'


def valid_output():
    try:
        return hashlib.sha256(gzip.decompress(OUTPUT.read_bytes())).hexdigest() == TABLE_SHA
    except (OSError, EOFError):
        return False


def build(package):
    if hashlib.sha256(package.read_bytes()).hexdigest() != PACKAGE_SHA:
        raise RuntimeError('IPADIC package checksum mismatch')
    with tarfile.open(package) as archive:
        features = gzip.decompress(archive.extractfile('package/dict/tid_pos.dat.gz').read())
        entries = gzip.decompress(archive.extractfile('package/dict/tid.dat.gz').read())
    words = {}
    for offset in range(0, len(entries) - 9, 10):
        _, _, cost, position = struct.unpack_from('<hhhI', entries, offset)
        if position >= len(features):
            continue
        end = features.find(b'\0', position)
        if end < 0:
            continue
        fields = features[position:end].decode('utf-8').split(',')
        if len(fields) < 9 or not re.search('[\u3400-\u9fff]', fields[0]) or len(fields[0]) > 32 or not re.fullmatch('[\u3040-\u30ffー]+', fields[8]):
            continue
        reading = ''.join(chr(ord(c) - 96) if '\u30a1' <= c <= '\u30f6' else c for c in fields[8])
        alternatives = words.setdefault(fields[0], {})
        alternatives[reading] = min(cost, alternatives.get(reading, cost))
    table = ('\n'.join(word + '\t' + ','.join(sorted(readings, key=lambda r: (readings[r], r))) for word, readings in sorted(words.items())) + '\n').encode()
    if hashlib.sha256(table).hexdigest() != TABLE_SHA:
        raise RuntimeError('Generated IPADIC table checksum mismatch')
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_bytes(gzip.compress(table, mtime=0))
    print(f'News readings: {len(words)} dictionary words; {OUTPUT.stat().st_size} compressed bytes')


if __name__ == '__main__':
    args = argparse.ArgumentParser()
    args.add_argument('--package', type=Path)
    options = args.parse_args()
    if valid_output():
        print('News reading dictionary verified')
    elif options.package:
        build(options.package)
    else:
        with tempfile.TemporaryDirectory(prefix='aponar-news-') as temporary:
            package = Path(temporary) / 'kuromoji.tgz'
            request = urllib.request.Request(URL, headers={'User-Agent': 'AponarNihonContentBuilder/1'})
            with urllib.request.urlopen(request, timeout=45) as response, package.open('wb') as target:
                total = 0
                while chunk := response.read(1024 * 1024):
                    total += len(chunk)
                    if total > 24 * 1024 * 1024:
                        raise RuntimeError('IPADIC package too large')
                    target.write(chunk)
            build(package)

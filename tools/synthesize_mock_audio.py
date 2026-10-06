"""Render the checked-in Japanese listening scripts with VOICEVOX CORE.

Requires the official voicevox_core Python wheel, VOICEVOX ONNX Runtime,
Open JTalk UTF-8 dictionary, and voice models 0.vvm and 4.vvm. Generated
recordings carry the credits on mock-content-notes.html and in each question.
Models and the synthesis cache are kept outside the published website.
"""
import argparse
import concurrent.futures
import hashlib
import io
import json
import multiprocessing
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SPEED = {'n5': .92, 'n4': .96, 'n3': 1.0}
SYNTH = None
ENGINE = None

def initialize(engine_root):
    global SYNTH, ENGINE
    from voicevox_core.blocking import Onnxruntime, OpenJtalk, Synthesizer, VoiceModelFile
    ENGINE = Path(engine_root)
    runtime = next(ENGINE.glob('**/libvoicevox_onnxruntime.so.1.*'))
    dictionary = ENGINE / 'open_jtalk_dic_utf_8-1.11'
    SYNTH = Synthesizer(Onnxruntime.load_once(filename=str(runtime)), OpenJtalk(str(dictionary)), cpu_num_threads=2)
    for name in ['0.vvm', '4.vvm']:
        with VoiceModelFile.open(str(ENGINE / name)) as model:
            SYNTH.load_voice_model(model)
    (ENGINE / 'utterance-cache').mkdir(exist_ok=True)

def pcm(text, voice, speed):
    key = hashlib.sha256(json.dumps([text, voice, speed], ensure_ascii=False).encode()).hexdigest()
    target = ENGINE / 'utterance-cache' / (key + '.wav')
    if target.exists():
        data = target.read_bytes()
    else:
        query = SYNTH.create_audio_query(text, voice)
        query.speed_scale = speed
        query.pre_phoneme_length = .07
        query.post_phoneme_length = .12
        data = SYNTH.synthesis(query, voice)
        # Another process may render the same utterance. Atomic replacement keeps
        # readers from seeing a partial WAV; both renderings use identical inputs.
        import os
        temp = target.with_suffix(f'.{os.getpid()}.partial')
        temp.write_bytes(data)
        temp.replace(target)
    with wave.open(io.BytesIO(data), 'rb') as wav:
        assert wav.getnchannels() == 1 and wav.getsampwidth() == 2
        assert wav.getframerate() == 24000
        return np.frombuffer(wav.readframes(wav.getnframes()), dtype=np.int16)

def render(job):
    level, q = job
    scripts = q['audioSegments']
    digest = hashlib.sha256(json.dumps([SPEED[level], scripts], ensure_ascii=False, sort_keys=True).encode()).hexdigest()
    target = ROOT / q['audioUrl'].lstrip('/')
    sidecar = ENGINE / 'utterance-cache' / (q['id'] + '.json')
    if target.exists() and sidecar.exists() and json.loads(sidecar.read_text()).get('scriptSha256') == digest:
        return json.loads(sidecar.read_text())
    pause = np.zeros(round(.38 * 24000), dtype=np.int16)
    parts = [np.zeros(4800, dtype=np.int16)]
    for s in scripts:
        parts.extend([pcm(s['text'], s['voice'], SPEED[level]), pause])
    data = np.concatenate(parts)
    assert len(data) > 24000 * 5, q['id']
    rms = float(np.sqrt(np.mean((data.astype(np.float64) / 32768) ** 2)))
    assert .006 < rms < .5, (q['id'], rms)
    clipped = float(np.mean(np.abs(data.astype(np.int32)) >= 32760))
    assert clipped < .003, (q['id'], clipped)
    wav_bytes = io.BytesIO()
    with wave.open(wav_bytes, 'wb') as wav:
        wav.setnchannels(1); wav.setsampwidth(2); wav.setframerate(24000)
        wav.writeframes(data.tobytes())
    target.parent.mkdir(parents=True, exist_ok=True)
    temp = target.with_suffix('.partial')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', 'pipe:0', '-ac', '1', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '64k', '-metadata', 'title='+q['id'], '-metadata', 'artist='+q['audioCredit'], '-f', 'mp3', str(temp)], input=wav_bytes.getvalue(), check=True)
    temp.replace(target)
    summary = {'id': q['id'], 'path': q['audioUrl'], 'scriptSha256': digest, 'fileSha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'seconds': round(len(data) / 24000, 3), 'rms': round(rms, 5), 'clippedFraction': round(clipped, 7), 'bytes': target.stat().st_size}
    sidecar.write_text(json.dumps(summary))
    return summary

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--engine-root', type=Path, required=True)
    parser.add_argument('--workers', type=int, default=3)
    parser.add_argument('--limit', type=int)
    args = parser.parse_args()
    jobs = []
    for level in SPEED:
        questions = json.loads((ROOT / f'tools/content/generated-mock/{level}-listening-authored.json').read_text())['questions']
        jobs.extend((level, q) for q in questions)
    if args.limit:
        jobs = jobs[:args.limit]
    report = []
    with concurrent.futures.ProcessPoolExecutor(max_workers=args.workers, initializer=initialize, initargs=(str(args.engine_root),), mp_context=multiprocessing.get_context('spawn')) as pool:
        for item in pool.map(render, jobs, chunksize=1):
            report.append(item)
            if len(report) % 20 == 0 or len(report) == len(jobs):
                print(f"Rendered {len(report)}/{len(jobs)} recordings", flush=True)
    destination = ROOT / 'tools/content/mock-original-audio-audit.json'
    destination.write_text(json.dumps({'engine': 'VOICEVOX CORE 0.17.0', 'voices': ['VOICEVOX:四国めたん', 'VOICEVOX:玄野武宏(CV:ガロ)'], 'recordings': report}, ensure_ascii=False, indent=2) + '\n')
    print('Audio duration:', round(sum(q['seconds'] for q in report)/60, 1), 'minutes', flush=True)

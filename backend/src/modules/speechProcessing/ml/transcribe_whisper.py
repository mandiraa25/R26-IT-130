import argparse
import json
import sys


def emit(payload):
    print(json.dumps(payload, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description="Transcribe audio with local Whisper.")
    parser.add_argument("--audio", required=True, help="Path to normalized audio file")
    parser.add_argument("--model-size", default="tiny.en", help="Whisper model size/name")
    parser.add_argument("--device", default="cpu", help="Whisper device")
    parser.add_argument("--compute-type", default="int8", help="Whisper compute type")
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except Exception as exc:
        emit({
            "status": "failed",
            "error": f"faster-whisper is not installed or could not load: {exc}",
        })
        return

    # Load audio data via soundfile to bypass any PyAV container decode issues
    audio_input = args.audio
    try:
        import soundfile as sf
        audio_data, sr = sf.read(args.audio, dtype="float32")
        if hasattr(audio_data, "ndim") and audio_data.ndim > 1:
            audio_data = audio_data.mean(axis=1)
        audio_input = audio_data
    except Exception as exc:
        print(f"Warning: could not read audio with soundfile: {exc}", file=sys.stderr)
        audio_input = args.audio

    try:
        try:
            model = WhisperModel(
                args.model_size,
                device=args.device,
                compute_type=args.compute_type,
                local_files_only=True,
            )
        except Exception:
            model = WhisperModel(
                args.model_size,
                device=args.device,
                compute_type=args.compute_type,
                local_files_only=False,
            )

        segments, info = model.transcribe(
            audio_input,
            beam_size=1,
            vad_filter=True,
            language="en",
            condition_on_previous_text=False,
        )
        text_parts = []
        for segment in segments:
            if getattr(segment, "text", None):
                text_parts.append(segment.text.strip())
        asr_text = " ".join(text_parts).strip()

        emit({
            "status": "success",
            "asrProvider": "whisper",
            "asrModel": args.model_size,
            "asrText": asr_text,
            "language": getattr(info, "language", "en"),
            "durationSec": getattr(info, "duration", None),
        })
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        emit({
            "status": "failed",
            "error": str(exc),
            "asrModel": args.model_size,
        })


if __name__ == "__main__":
    main()

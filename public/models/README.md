# face-api.js model weights

Place face-api.js weight files in this directory so facial awareness can load at runtime.

Required manifests (and their shard files):

- `tiny_face_detector_model-weights_manifest.json`
- `face_expression_model-weights_manifest.json`

## Download

From the project root:

```bash
bash scripts/download-face-models.sh
```

Or copy from the [face-api.js weights](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) repository into `public/models/`.

If models are missing, the Recovery Room shows **Models unavailable** and continues without crashing.

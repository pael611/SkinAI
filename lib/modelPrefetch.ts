export async function prefetchModel(url: string = "/model/best_skin_model.onnx") {
  try {
    await fetch(url, { cache: "force-cache" })
  } catch (_) {
    // ignore; navigation will attempt to load again
  }
}

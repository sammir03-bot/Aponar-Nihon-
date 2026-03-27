const CACHE_NAME = "aponar-nihon-offline-v1";

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo.png",

  "/about.html",
  "/contact.html",
  "/dashboard.html",
  "/privacy-policy.html",

  "/Hiragana-Katagana.html",

  "/N5-Vocabulary.html",
  "/N5-Vocabulary-part1.html",
  "/N5-Vocabulary-part2.html",
  "/N5-Vocabulary-part3.html",
  "/N5-Vocabulary-part4.html",
  "/N5-Vocabulary-part5.html",
  "/N5-Vocabulary-part6.html",
  "/N5-Vocabulary-part7.html",
  "/N5-Vocabulary-part8.html",
  "/N5-Vocabulary-part9.html",
  "/N5-Vocabulary-part10.html",

  "/N5-Grammar-part1.html",
  "/N5-Grammar-part2.html",
  "/N5-Grammar-part3.html",
  "/N5-Grammar-part4.html",
  "/N5-Grammar-part5.html",
  "/N5-Grammar-part6.html",
  "/N5-Grammar-part7.html",
  "/N5-Grammar-part8.html",
  "/N5-Grammar-part9.html",
  "/N5-Grammar-part10.html",

  "/N5-Kanji-part1.html",
  "/N5-Kanji-part2.html",
  "/N5-Kanji-part3.html",
  "/N5-Kanji-part4.html",
  "/N5-Kanji-part5.html",
  "/N5-Kanji-part6.html",
  "/N5-Kanji-part7.html",
  "/N5-Kanji-part8.html",
  "/N5-Kanji-part9.html",
  "/N5-Kanji-part10.html",

  "/N5-Reading-part1.html",
  "/N5-Reading-part2.html",
  "/N5-Reading-part3.html",
  "/N5-Reading-part4.html",
  "/N5-Reading-part5.html",
  "/N5-Reading-part6.html",
  "/N5-Reading-part7.html",
  "/N5-Reading-part8.html",
  "/N5-Reading-part9.html",
  "/N5-Reading-part10.html",

  "/ssw.html",
  "/ssw-exam.html",
  "/ssw-faq.html",
  "/ssw-interview.html",
  "/ssw-job.html",
  "/ssw-overview.html",
  "/ssw-salary.html",
  "/ssw-visa-process.html"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
            return response;
          })
          .catch(() => caches.match("/index.html"))
      );
    })
  );
});

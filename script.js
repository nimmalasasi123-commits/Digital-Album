const months = [
    { month: 1, photos: 2 },
    { month: 2, photos: 1 },
    { month: 3, photos: 4 },
    { month: 4, photos: 1 },
    { month: 5, photos: 4 },
    { month: 6, photos: 4 },
    { month: 7, photos: 4 },
    { month: 8, photos: 4 },
    { month: 9, photos: 4 }
];

const memoryAlbums = [
    {
        id: "1",
        title: "First Memory",
        description: "The first little moments we wanted to keep close.",
        media: ["1memory1.jpeg", "1memory2.jpeg", "1memory3.jpeg"]
    },
    {
        id: "2",
        title: "Second Memory",
        description: "A little collection of precious time together.",
        media: ["2memory1.jpeg"]
    },
    {
        id: "3",
        title: "Mamuu's Memory",
        description: "Photos and little videos, together in one place.",
        media: ["3memory1.mp4", "3memory2.mp4", "3memory3.jpeg", "3memory4.jpeg", "3memory5.jpeg", "3memory6.jpeg", "3memory7.mp4"]
    },
    {
        id: "4",
        title: "Fourth Memory",
        description: "More lovely moments, saved to watch again.",
        media: ["4memory1.mp4", "4memory2.mp4"]
    }
];

const monthGrid = document.getElementById("monthGrid");
const introScreen = document.getElementById("introScreen");
const introStart = document.getElementById("introStart");
const introLoading = document.getElementById("introLoading");
const introLoadingFill = document.getElementById("introLoadingFill");
const introLoadingPercent = document.getElementById("introLoadingPercent");
const introTitle = document.getElementById("introTitle");
const introVideo = document.getElementById("introVideo");
const introSong = document.getElementById("introSong");
const introSkip = document.getElementById("introSkip");
const passwordGate = document.getElementById("passwordGate");
const passwordForm = document.getElementById("passwordForm");
const passwordEntry = document.getElementById("passwordEntry");
const passwordInput = document.getElementById("passwordInput");
const passwordError = document.getElementById("passwordError");
const specialButton = document.getElementById("specialBtn");
const photoDialog = document.getElementById("photoDialog");
const dialogImage = document.getElementById("dialogImage");
const dialogVideo = document.getElementById("dialogVideo");
const dialogVideoSource = document.getElementById("dialogVideoSource");
const videoFallback = document.getElementById("videoFallback");
const videoFallbackMessage = document.getElementById("videoFallbackMessage");
const videoRetry = document.getElementById("videoRetry");
const videoDownload = document.getElementById("videoDownload");
const dialogStage = document.querySelector(".dialog-stage");
const viewerFrame = document.getElementById("viewerFrame");
const viewerProgress = document.getElementById("viewerProgress");
const viewerProgressFill = document.getElementById("viewerProgressFill");
const dialogCount = document.getElementById("dialogCount");
const dialogCaption = document.getElementById("dialogCaption");
const memoriesDialog = document.getElementById("memoriesDialog");
const albumBrowser = document.getElementById("albumBrowser");
const albumDetail = document.getElementById("albumDetail");
const memoryAlbumGrid = document.getElementById("memoryAlbumGrid");
const memoryMediaGrid = document.getElementById("memoryMediaGrid");
const memoryForm = document.getElementById("memoryForm");
const memoryPhotoInput = document.getElementById("memoryPhoto");
const memoryCaptionInput = document.getElementById("memoryCaption");
const memoryStatus = document.getElementById("memoryStatus");
const waterSong = document.getElementById("waterSong");
const waterEffectLayer = document.getElementById("waterEffectLayer");
let activePhotos = [];
let activePhotoIndex = 0;
let activeAlbumId = null;
let memoryDatabase;
const memoryObjectUrls = new Map();
let videoLoadId = 0;
let introLoadFallbackTimer;
let introWelcomeFinished = false;
let introCanPlay = false;
let introPlayAttempted = false;
let introPlaybackStarted = false;
let introFinaleStarted = false;
let introStarted = false;
let introSequenceStage = "video9";

function stopIntroSong() {
    if (!introSong) return;
    introSong.pause();
    introSong.currentTime = 0;
}

function hideIntroSkip() {
    if (!introSkip) return;
    introSkip.hidden = true;
}

function showIntroSkip() {
    if (!introSkip) return;
    introSkip.hidden = false;
}

function showPasswordGate() {
    if (!passwordGate || !passwordInput) return;
    stopIntroSong();
    introSong.muted = true;
    passwordGate.hidden = false;
    passwordInput.value = "";
    passwordError.textContent = "";
    updatePasswordDisplay();
    window.setTimeout(() => passwordInput.focus(), 50);
}

function hidePasswordGate() {
    if (!passwordGate) return;
    passwordGate.hidden = true;
    passwordError.textContent = "";
}

function playIntroStage(videoName, songName, allowSkip) {
    if (!introVideo || !introSong || !introScreen) return;
    introScreen.classList.remove("is-welcome-visible", "is-welcome-fading", "is-video-changing");
    introScreen.classList.add("is-video-visible");
    introSong.muted = false;
    introVideo.src = videoName;
    introSong.src = songName;
    introVideo.load();
    introSong.load();
    introVideo.muted = true;
    introVideo.volume = 0;
    introVideo.currentTime = 0;
    introSong.currentTime = 0;
    if (allowSkip) showIntroSkip();
    else hideIntroSkip();
    introVideo.play().catch(() => {});
    introSong.play().catch(() => {});
}

function showIntroTitleCard(title, onComplete) {
    introSong.pause();
    introSong.currentTime = 0;
    introScreen.classList.add("is-video-changing");

    window.setTimeout(() => {
        introScreen.classList.remove("is-video-visible", "is-video-changing", "is-welcome-visible", "is-welcome-fading");
        introTitle.textContent = title;
        introTitle.hidden = false;
        void introTitle.offsetWidth;
        introScreen.classList.add("is-welcome-visible");

        window.setTimeout(() => {
            introScreen.classList.add("is-welcome-fading");
            window.setTimeout(onComplete, 650);
        }, 1400);
    }, 450);
}

function attemptPasswordUnlock() {
    if (!passwordInput || passwordInput.value.length !== 4) return false;
    if (passwordInput.value === "2409") {
        hidePasswordGate();
        closeIntro();
        return true;
    }
    passwordError.textContent = "Incorrect password. Try again.";
    passwordInput.value = "";
    updatePasswordDisplay();
    return false;
}

function handleIntroSequenceEnd() {
    if (introSequenceStage === "video9") {
        introSequenceStage = "titleTo";
        showIntroTitleCard("To", () => {
            introSequenceStage = "video1";
            introScreen.classList.add("is-video-visible");
            playIntroStage("video.mp4", "song 1.mp3", false);
        });
        return;
    }

    if (introSequenceStage === "video1") {
        introSequenceStage = "titleAlbum";
        showIntroTitleCard("Panchami's Digital Album", () => {
            introSequenceStage = "video8";
            playIntroStage("video 8.mp4", "song 8.mp3", true);
        });
        return;
    }

    if (introSequenceStage === "video8") {
        hideIntroSkip();
        showPasswordGate();
    }
}

function closeIntro() {
    if (!introScreen || introScreen.classList.contains("is-closing")) return;
    hideIntroSkip();
    hidePasswordGate();
    stopIntroSong();
    document.body.classList.add("intro-revealing");
    introScreen.classList.add("is-closing");
    window.setTimeout(() => {
        introScreen.remove();
        document.body.classList.remove("intro-active");
        document.body.classList.remove("intro-revealing");
    }, 900);
}

function startIntroVideo() {
    if (!introVideo || !introScreen || !introWelcomeFinished || !introCanPlay || introPlayAttempted) return;
    introPlayAttempted = true;
    introVideo.muted = true;
    introVideo.volume = 0;
    introVideo.currentTime = 0;
    introSong.currentTime = 0;
    introVideo.play().catch(() => {
        introPlayAttempted = false;
    });
    introSong.play().catch(() => {});
}

if (introScreen && introVideo) {
    document.body.classList.add("intro-active");
    introVideo.controls = false;
    introVideo.addEventListener("canplay", () => {
        introCanPlay = true;
        if (introWelcomeFinished) {
            startIntroVideo();
        }
    }, { once: true });
    introVideo.addEventListener("playing", () => {
        introPlaybackStarted = true;
        window.clearTimeout(introLoadFallbackTimer);
        if (passwordGate?.hidden) introSong?.play().catch(() => {});
    });
    introScreen.addEventListener("pointerdown", () => {
        if (!introWelcomeFinished || !passwordGate?.hidden) return;
        if (!introPlaybackStarted) {
            introPlayAttempted = false;
            startIntroVideo();
        }
        if (introSong?.paused) introSong.play().catch(() => {});
    });
    introStart?.addEventListener("click", () => {
        if (introStarted) return;
        introStarted = true;
        introStart.hidden = true;
        introLoading.hidden = false;
        const loadingStartedAt = performance.now();
        const updateLoading = (now) => {
            const progress = Math.min((now - loadingStartedAt) / 2000, 1);
            const percentage = Math.round(progress * 100);
            introLoadingFill.style.width = `${percentage}%`;
            introLoadingPercent.textContent = `${percentage}%`;
            if (progress < 1) {
                window.requestAnimationFrame(updateLoading);
                return;
            }
            introLoading.hidden = true;
            introSequenceStage = "welcomeTitle";
            showIntroTitleCard("Welcome", () => {
                introWelcomeFinished = true;
                introScreen.classList.add("is-video-visible");
                introSequenceStage = "video9";
                playIntroStage("video 9.mp4", "song 9.mp3", false);
            });
        };
        window.requestAnimationFrame(updateLoading);
    });
    introVideo.addEventListener("ended", () => {
        handleIntroSequenceEnd();
    });
    introVideo.addEventListener("error", () => {
        if (!introStarted) return;
        window.clearTimeout(introLoadFallbackTimer);
        if (introSequenceStage === "video8") {
            hideIntroSkip();
            showPasswordGate();
            return;
        }
        closeIntro();
    });
    introSkip?.addEventListener("click", () => {
        if (introSequenceStage !== "video8") return;
        introVideo.pause();
        introSong.pause();
        introVideo.currentTime = introVideo.duration || 0;
        introSong.currentTime = introSong.duration || 0;
        hideIntroSkip();
        showPasswordGate();
    });
    passwordForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        attemptPasswordUnlock();
    });
    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            passwordInput.value = passwordInput.value.replace(/\D/g, "").slice(0, 4);
            updatePasswordDisplay();
            passwordError.textContent = "";
            if (passwordInput.value.length === 4) attemptPasswordUnlock();
        });
        passwordInput.addEventListener("focus", () => {
            updatePasswordDisplay();
        });
        passwordEntry?.addEventListener("click", () => passwordInput.focus());
        updatePasswordDisplay();
    }
}

function updatePasswordDisplay() {
    if (!passwordInput) return;
    const digits = passwordInput.value.replace(/\D/g, "").slice(0, 4);
    const slots = document.querySelectorAll(".password-slot");
    slots.forEach((slot, index) => {
        const filled = index < digits.length;
        slot.textContent = "♡";
        slot.classList.toggle("filled", filled);
        slot.style.opacity = filled ? "1" : ".35";
    });
}

function monthLabel(monthNumber) {
    return `Month ${monthNumber}`;
}

function createPhotoPath(monthNumber, photoNumber) {
    return `${monthNumber}month${photoNumber}.jpeg`;
}

function openViewer(photos, startIndex = 0) {
    activePhotos = photos;
    activePhotoIndex = startIndex;
    updateViewer();
    photoDialog.showModal();
}

function updateViewer() {
    const photo = activePhotos[activePhotoIndex];
    const isVideo = photo.type === "video";
    videoLoadId += 1;
    dialogStage.style.setProperty("--viewer-photo", `url("${photo.src}")`);
    dialogVideo.pause();
    dialogVideo.hidden = !isVideo;
    dialogImage.hidden = isVideo;
    videoFallback.hidden = true;
    if (isVideo) {
        waterSong.pause();
        dialogVideo.muted = false;
        dialogVideo.volume = 1;
        setVideoSource(dialogVideo, photo.src, photo.mimeType);
        dialogVideo.setAttribute("aria-label", photo.alt);
        videoDownload.href = photo.src;
        videoDownload.download = photo.src.split(/[\\/]/).pop().split("?")[0] || "panchami-memory.mp4";
        dialogVideo.load();
    } else {
        dialogVideoSource.removeAttribute("src");
        dialogVideoSource.removeAttribute("type");
        dialogImage.src = photo.src;
        dialogImage.alt = photo.alt;
    }
    dialogCount.textContent = `${String(activePhotoIndex + 1).padStart(2, "0")} / ${String(activePhotos.length).padStart(2, "0")}`;
    dialogCaption.textContent = photo.caption;
    viewerProgress.setAttribute("aria-valuemax", String(activePhotos.length));
    viewerProgress.setAttribute("aria-valuenow", String(activePhotoIndex + 1));
    viewerProgressFill.style.transform = `scaleX(${(activePhotoIndex + 1) / activePhotos.length})`;
    viewerFrame.classList.remove("viewer-frame-enter");
    void viewerFrame.offsetWidth;
    viewerFrame.classList.add("viewer-frame-enter");
}

function stepPhoto(direction) {
    activePhotoIndex = (activePhotoIndex + direction + activePhotos.length) % activePhotos.length;
    updateViewer();
}

function makeMonthCard(monthNumber, photoCount) {
    const label = monthLabel(monthNumber);
    const card = document.createElement("button");
    card.className = "month-card";
    card.type = "button";
    card.setAttribute("aria-label", `Open ${label}, ${photoCount} photos`);
    card.innerHTML = `
        <span class="month-image-wrap">
            <img src="${createPhotoPath(monthNumber, 1)}" alt="Panchami at ${monthNumber} month${monthNumber === 1 ? "" : "s"}" loading="lazy">
            <span class="month-open" aria-hidden="true">↗</span>
        </span>
        <span class="month-card-meta"><span class="month-number">MONTH ${String(monthNumber).padStart(2, "0")}</span><span class="photo-total">${photoCount} ${photoCount === 1 ? "photo" : "photos"}</span></span>
        <span class="month-card-title">${label}</span>`;
    card.addEventListener("click", () => {
        const photos = Array.from({ length: photoCount }, (_, index) => ({
            src: createPhotoPath(monthNumber, index + 1),
            alt: `Panchami at ${monthNumber} month${monthNumber === 1 ? "" : "s"}, photo ${index + 1}`,
            caption: `${label} · ${String(index + 1).padStart(2, "0")}`
        }));
        openViewer(photos);
    });
    return card;
}

function makeWaitingCard(monthNumber) {
    const label = monthLabel(monthNumber);
    const card = document.createElement("div");
    card.className = "month-card waiting-card";
    card.setAttribute("aria-label", `${label} chapter waiting for photos`);
    card.innerHTML = `
        <span class="waiting-art" aria-hidden="true"><span>✳</span><span class="waiting-month">${String(monthNumber).padStart(2, "0")}</span></span>
        <span class="month-card-meta"><span class="month-number">MONTH ${String(monthNumber).padStart(2, "0")}</span><span class="photo-total">Coming soon</span></span>
        <span class="month-card-title">${label}</span>`;
    return card;
}

const photosByMonth = new Map(months.map(({ month, photos }) => [month, photos]));
for (let monthNumber = 1; monthNumber <= 9; monthNumber += 1) {
    const photoCount = photosByMonth.get(monthNumber);
    monthGrid.append(photoCount ? makeMonthCard(monthNumber, photoCount) : makeWaitingCard(monthNumber));
}

const photoTotal = months.reduce((total, entry) => total + entry.photos, 0);
document.getElementById("photoCount").textContent = photoTotal;
document.getElementById("chapterCount").textContent = months.length;

function mediaType(pathOrType) {
    return /\.(mp4|webm|ogg|mov)$/i.test(pathOrType) || pathOrType.startsWith("video/") ? "video" : "image";
}

function videoMimeType(path) {
    const extension = String(path).split(/[?#]/, 1)[0].split(".").pop().toLowerCase();
    return ({ mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg", mov: "video/quicktime" })[extension] || "";
}

function setVideoSource(video, sourcePath, mimeType = videoMimeType(sourcePath)) {
    const source = video === dialogVideo ? dialogVideoSource : document.createElement("source");
    source.src = sourcePath;
    if (mimeType) source.type = mimeType;
    else source.removeAttribute("type");
    if (source !== dialogVideoSource) video.replaceChildren(source);
}

function describeAlbumMedia(album) {
    const photos = album.media.filter((path) => mediaType(path) === "image").length;
    const videos = album.media.length - photos;
    const parts = [];
    if (photos) parts.push(`${photos} ${photos === 1 ? "photo" : "photos"}`);
    if (videos) parts.push(`${videos} ${videos === 1 ? "video" : "videos"}`);
    return parts.join(" · ");
}

function makeAlbumCard(album, savedMedia) {
    const card = document.createElement("button");
    card.className = "memory-album-card";
    card.type = "button";
    const savedPhotos = savedMedia.filter((item) => item.type !== "video").length;
    const savedVideos = savedMedia.length - savedPhotos;
    const baseCount = describeAlbumMedia(album);
    const extraCount = [
        savedPhotos ? `${savedPhotos} ${savedPhotos === 1 ? "photo" : "photos"}` : "",
        savedVideos ? `${savedVideos} ${savedVideos === 1 ? "video" : "videos"}` : ""
    ].filter(Boolean).join(" · ");
    const mediaCount = [baseCount, extraCount].filter(Boolean).join(" · ");
    card.setAttribute("aria-label", `Open ${album.title}, ${mediaCount}`);
    const cover = document.createElement("span");
    cover.className = "album-cover";
    const firstImage = album.media.find((path) => mediaType(path) === "image");
    if (firstImage) {
        const image = document.createElement("img");
        image.src = firstImage;
        image.alt = "";
        image.loading = "lazy";
        cover.append(image);
    } else {
        const videoCover = document.createElement("video");
        setVideoSource(videoCover, album.media[0]);
        videoCover.muted = true;
        videoCover.preload = "metadata";
        videoCover.playsInline = true;
        cover.append(videoCover);
        const videoFallback = document.createElement("span");
        videoFallback.className = "video-cover-fallback";
        videoFallback.textContent = "VIDEO MEMORY";
        videoFallback.hidden = true;
        videoCover.addEventListener("error", () => {
            videoFallback.hidden = false;
            cover.classList.add("video-cover-error");
        });
        cover.append(videoFallback);
    }
    const count = document.createElement("span");
    count.className = "album-media-count";
    count.textContent = mediaCount;
    cover.append(count);
    const number = document.createElement("span");
    number.className = "album-card-number";
    number.textContent = `MEMORY ${album.id.padStart(2, "0")}`;
    const title = document.createElement("span");
    title.className = "album-card-title";
    title.textContent = album.title;
    const arrow = document.createElement("span");
    arrow.className = "album-card-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    card.append(cover, number, title, arrow);
    card.addEventListener("click", () => openAlbum(album));
    return card;
}

async function renderAlbumCards() {
    const saved = memoryDatabase ? await readSavedMemories() : [];
    memoryAlbumGrid.replaceChildren(...memoryAlbums.map((album) =>
        makeAlbumCard(album, saved.filter((item) => item.albumId === album.id))
    ));
}

async function openAlbum(album) {
    activeAlbumId = album.id;
    albumBrowser.hidden = true;
    albumDetail.hidden = false;
    document.getElementById("albumEyebrow").textContent = `SPECIAL MEMORY ${album.id.padStart(2, "0")}`;
    document.getElementById("albumTitle").textContent = album.title;
    document.getElementById("albumDescription").textContent = album.description;
    memoryStatus.textContent = "";
    memoryForm.reset();
    await renderAlbumMedia(album);
    document.getElementById("albumTitle").focus({ preventScroll: true });
    memoriesDialog.scrollTo({ top: 0, behavior: "smooth" });
}

function albumMediaItem(album, source, index) {
    return {
        src: source,
        type: mediaType(source),
        mimeType: mediaType(source) === "video" ? videoMimeType(source) : "",
        alt: `${album.title}, ${mediaType(source)} ${index + 1}`,
        caption: `${album.title} · ${String(index + 1).padStart(2, "0")}`
    };
}

async function renderAlbumMedia(album) {
    const media = album.media.map((source, index) => albumMediaItem(album, source, index));
    if (memoryDatabase) {
        const saved = await readSavedMemories();
        saved.filter((item) => item.albumId === album.id).forEach((item, index) => {
            let source = memoryObjectUrls.get(item.id);
            if (!source) {
                source = URL.createObjectURL(item.file || item.image);
                memoryObjectUrls.set(item.id, source);
            }
            media.push({
                id: item.id,
                src: source,
                type: item.type || "image",
                mimeType: item.file?.type || item.mimeType || videoMimeType(item.file?.name || source),
                alt: item.caption,
                caption: item.caption,
                savedIndex: index
            });
        });
    }

    memoryMediaGrid.replaceChildren();
    if (!media.length) {
        const emptyNote = document.createElement("p");
        emptyNote.className = "empty-memories";
        emptyNote.textContent = "This little album is ready for its first memory.";
        memoryMediaGrid.append(emptyNote);
        return;
    }

    media.forEach((item) => {
        const tile = document.createElement("article");
        tile.className = "memory-media-item";
        const openButton = document.createElement("button");
        openButton.className = "memory-media-open";
        openButton.type = "button";
        openButton.setAttribute("aria-label", `Open ${item.caption}`);
        if (item.type === "video") {
            const video = document.createElement("video");
            setVideoSource(video, item.src, item.mimeType);
            video.muted = true;
            video.preload = "metadata";
            video.playsInline = true;
            const videoFallback = document.createElement("span");
            videoFallback.className = "video-tile-fallback";
            videoFallback.textContent = "Preview unavailable · open to download";
            videoFallback.hidden = true;
            video.addEventListener("error", () => videoFallback.hidden = false);
            openButton.append(video);
            const playMark = document.createElement("span");
            playMark.className = "media-play-mark";
            playMark.setAttribute("aria-hidden", "true");
            playMark.textContent = "▶";
            openButton.append(playMark);
            openButton.append(videoFallback);
        } else {
            const image = document.createElement("img");
            image.src = item.src;
            image.alt = item.alt;
            image.loading = "lazy";
            openButton.append(image);
        }
        const caption = document.createElement("span");
        caption.className = "memory-media-caption";
        caption.textContent = item.caption;
        openButton.append(caption);
        openButton.addEventListener("click", () => openViewer(media, media.indexOf(item)));
        tile.append(openButton);

        if (item.id) {
            const removeButton = document.createElement("button");
            removeButton.className = "remove-memory";
            removeButton.type = "button";
            removeButton.setAttribute("aria-label", `Remove ${item.caption}`);
            removeButton.textContent = "×";
            removeButton.addEventListener("click", async () => {
                removeButton.disabled = true;
                try {
                    await removeSavedMemory(item.id);
                    const savedUrl = memoryObjectUrls.get(item.id);
                    if (savedUrl) URL.revokeObjectURL(savedUrl);
                    memoryObjectUrls.delete(item.id);
                    await renderAlbumMedia(album);
                    await renderAlbumCards();
                    memoryStatus.textContent = "Memory removed.";
                } catch {
                    removeButton.disabled = false;
                    memoryStatus.textContent = "That memory could not be removed. Please try again.";
                }
            });
            tile.append(removeButton);
        }
        memoryMediaGrid.append(tile);
    });
}

renderAlbumCards();
specialButton.addEventListener("click", () => memoriesDialog.showModal());
document.getElementById("memoriesDialogClose").addEventListener("click", () => memoriesDialog.close());
document.getElementById("backToAlbums").addEventListener("click", () => {
    albumDetail.hidden = true;
    albumBrowser.hidden = false;
    activeAlbumId = null;
    memoriesDialog.scrollTo({ top: 0, behavior: "smooth" });
});

function openMemoryDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("panchami-special-memories", 1);
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains("memories")) {
                database.createObjectStore("memories", { keyPath: "id" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function readSavedMemories() {
    return new Promise((resolve, reject) => {
        const request = memoryDatabase.transaction("memories", "readonly").objectStore("memories").getAll();
        request.onsuccess = () => resolve(request.result.sort((first, second) => second.createdAt - first.createdAt));
        request.onerror = () => reject(request.error);
    });
}

function saveMemories(records) {
    return new Promise((resolve, reject) => {
        const transaction = memoryDatabase.transaction("memories", "readwrite");
        const store = transaction.objectStore("memories");
        records.forEach((record) => store.put(record));
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
    });
}

function removeSavedMemory(id) {
    return new Promise((resolve, reject) => {
        const transaction = memoryDatabase.transaction("memories", "readwrite");
        transaction.objectStore("memories").delete(id);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
    });
}

memoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const files = Array.from(memoryPhotoInput.files || []);
    const caption = memoryCaptionInput.value.trim();
    if (!files.length || !caption || !activeAlbumId) return;

    const invalidFile = files.find((file) => !file.type.startsWith("image/") && !file.type.startsWith("video/"));
    if (invalidFile) {
        memoryStatus.textContent = "Please choose image or video files only.";
        return;
    }

    const submitButton = memoryForm.querySelector(".save-memory-btn");
    submitButton.disabled = true;
    memoryStatus.textContent = "Saving your memory…";
    try {
        if (!memoryDatabase) memoryDatabase = await openMemoryDatabase();
        const records = files.map((file, index) => ({
            id: crypto.randomUUID(),
            caption: files.length > 1 ? `${caption} · ${index + 1}` : caption,
            file,
            type: file.type.startsWith("video/") ? "video" : "image",
            mimeType: file.type,
            albumId: activeAlbumId,
            createdAt: Date.now() + index
        }));
        await saveMemories(records);
        await renderAlbumMedia(memoryAlbums.find((album) => album.id === activeAlbumId));
        await renderAlbumCards();
        memoryForm.reset();
        document.getElementById("uploadLabel").textContent = "Choose photos or videos";
        memoryStatus.textContent = `${records.length} ${records.length === 1 ? "memory" : "memories"} saved in this browser.`;
    } catch {
        memoryStatus.textContent = "Could not save the photos in this browser. Try smaller image files or check browser storage settings.";
    } finally {
        submitButton.disabled = false;
    }
});

openMemoryDatabase()
    .then((database) => {
        memoryDatabase = database;
        return renderAlbumCards();
    })
    .catch(() => {
        memoryStatus.textContent = "Local photo storage is unavailable in this browser.";
    });

document.getElementById("dialogClose").addEventListener("click", () => photoDialog.close());
document.getElementById("previousPhoto").addEventListener("click", () => stepPhoto(-1));
document.getElementById("nextPhoto").addEventListener("click", () => stepPhoto(1));

photoDialog.addEventListener("click", (event) => {
    if (event.target === photoDialog) photoDialog.close();
});

photoDialog.addEventListener("close", () => {
    dialogVideo.pause();
    dialogVideoSource.removeAttribute("src");
    dialogVideoSource.removeAttribute("type");
    dialogVideo.load();
    videoFallback.hidden = true;
});

async function showVideoFallback() {
    if (dialogVideo.hidden) return;
    const loadId = videoLoadId;
    const failedUrl = dialogVideo.currentSrc || dialogVideoSource.src;
    let response;
    try {
        response = await fetch(failedUrl, { method: "HEAD", cache: "no-store" });
    } catch {
        if (loadId !== videoLoadId) return;
        videoFallbackMessage.textContent = "The video could not be reached. Check your connection and that the file was included in the site deployment, then retry.";
        videoFallback.hidden = false;
        return;
    }
    if (loadId !== videoLoadId) return;
    if (response.status === 404) {
        const filename = failedUrl.split("/").pop().split(/[?#]/)[0];
        videoFallbackMessage.textContent = `Video file not found: ${filename}. Check the exact filename and capitalization, then make sure it is included in the GitHub Pages deployment.`;
    } else if (!response.ok) {
        videoFallbackMessage.textContent = `The video server returned error ${response.status}. Check the deployment and retry.`;
    } else if (dialogVideo.error?.code === 3) {
        videoFallbackMessage.textContent = "The video file was found but could not be decoded. It may be damaged or use an unsupported codec; use MP4 with H.264 video and AAC audio for broad browser support.";
    } else if (dialogVideo.error?.code === 4) {
        videoFallbackMessage.textContent = "The video file was found, but this browser cannot play its media format or codec. Use MP4 with H.264 video and AAC audio for broad browser support.";
    } else {
        videoFallbackMessage.textContent = "The video file is present, but playback could not start. Check the connection and retry.";
    }
    videoFallback.hidden = false;
}

dialogVideo.addEventListener("error", showVideoFallback);
dialogVideoSource.addEventListener("error", showVideoFallback);
dialogVideo.addEventListener("play", () => {
    waterSong.pause();
    waterSong.currentTime = 0;
});
videoRetry.addEventListener("click", () => {
    videoLoadId += 1;
    videoFallback.hidden = true;
    dialogVideo.pause();
    dialogVideo.load();
});

memoriesDialog.addEventListener("close", () => {
    albumDetail.hidden = true;
    albumBrowser.hidden = false;
    activeAlbumId = null;
});

memoryPhotoInput.addEventListener("change", () => {
    const selectedFiles = Array.from(memoryPhotoInput.files || []);
    document.getElementById("uploadLabel").textContent = selectedFiles.length
        ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected`
        : "Choose photos or videos";
});

photoDialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") stepPhoto(-1);
    if (event.key === "ArrowRight") stepPhoto(1);
});

let touchStartX = 0;
let touchStartY = 0;

dialogStage.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

dialogStage.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].clientX - touchStartX;
    const deltaY = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
        stepPhoto(deltaX < 0 ? 1 : -1);
    }
}, { passive: true });

function playWaterTapSound() {
    waterSong.pause();
    waterSong.currentTime = 0;
    const playback = waterSong.play();
    if (playback) playback.catch(() => {});
}

function makeWaterTap(x, y) {
    const ripple = document.createElement("span");
    ripple.className = "water-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    waterEffectLayer.append(ripple);

    for (let index = 0; index < 6; index += 1) {
        const bubble = document.createElement("span");
        const angle = (Math.PI * 2 * index) / 6 + Math.random() * 0.3;
        const distance = 15 + Math.random() * 24;
        bubble.className = "water-bubble";
        bubble.style.left = `${x + Math.cos(angle) * distance}px`;
        bubble.style.top = `${y + Math.sin(angle) * distance}px`;
        bubble.style.setProperty("--bubble-size", `${7 + Math.random() * 13}px`);
        bubble.style.setProperty("--bubble-rise", `${42 + Math.random() * 54}px`);
        bubble.style.setProperty("--bubble-delay", `${index * 35}ms`);
        waterEffectLayer.append(bubble);
        bubble.addEventListener("animationend", () => bubble.remove(), { once: true });
    }
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
}

document.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (photoDialog.open || event.composedPath().includes(dialogVideo)) return;
    makeWaterTap(event.clientX, event.clientY);
    playWaterTapSound();
});

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("videoId");

    let videoIds = [];
    let currentIndex = -1;

    // Fetch all video IDs for next and previous buttons
    try {
      const response = await fetch("/api/video-ids");
      const data = await response.json();
      videoIds = data.videoIds;
      currentIndex = videoIds.indexOf(videoId);
      setupNavigation();
      updateNavigationButtons(); // Initial call to update button visibility
    } catch (error) {
      console.error("Error fetching video IDs:", error);
    }

    // Fetch the video details if a videoId is provided
    if (videoId) {
  try {
    const response = await fetch(`/api/videos/${videoId}`);
    const data = await response.json();

    if (data && data.video) {
      const videoElement = document.getElementById("video-player");
      videoElement.src = data.video.filePath;
      const thumbnailImg = document.querySelector(".thumbnail-img");
      thumbnailImg.src = data.video.thumbnail;

      // Display the title
     const videoTitleElement = document.getElementById("video-title");
     videoTitleElement.textContent = data.video.title;

      const previewImages = data.video.previewImages;
      if (previewImages && previewImages.length > 0) {
        const timeline = document.querySelector(".timeline");
        previewImages.forEach((imgSrc, index) => {
          const img = new Image();
          img.src = imgSrc;
          img.classList.add("preview-img");
          img.dataset.time = index * 10; // Images are for every 10 seconds
          timeline.appendChild(img);
        });
      }

      // Increment view count when the video starts playing
      videoElement.addEventListener("play", () => {
        fetch(`/log-view/${videoId}`, {
          method: "POST",
        }).catch(error => console.error("Error logging view:", error));
      });

      // Track watch time
    const watchTimeInterval = 10000; // 10 seconds
    let watchTime = 0;

    const sendWatchTime = () => {
      fetch(`/log-watch-time/${videoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ watchTime }),
      }).catch(error => console.error("Error logging watch time:", error));
    };

    const updateWatchTime = () => {
      if (!Video.paused && !Video.ended) {
        watchTime += 10;
        sendWatchTime();
      }
    };

    // Set interval to update watch time every 10 seconds
    setInterval(updateWatchTime, watchTimeInterval);
      
    }
  } catch (error) {
    console.error("Error fetching video details:", error);
  }
} else {
  console.error("No videoId found in URL");
}

    // Video player controls code
    const Video = document.querySelector("video");
    const videoContainer = document.querySelector(".video-container");
    const playPauseBtn = document.querySelector(".play-pause-btn");
    const theaterBtn = document.querySelector(".theater-btn");
    const fullScreenBtn = document.querySelector(".full-screen-btn");
    const miniPlayerBtn = document.querySelector(".mini-player-btn");
    const muteBtn = document.querySelector(".mute-btn");
    const speedBtn = document.querySelector(".speed-btn");
    const currentTimeElem = document.querySelector(".current-time");
    const totalTimeElem = document.querySelector(".total-time");
    const volumeSlider = document.querySelector(".volume-slider");
    const timelineContainer = document.querySelector(".timeline-container");
    const timeline = document.querySelector(".timeline");
    const thumbIndicator = document.querySelector(".thumb-indicator");

    document.addEventListener("keydown", (e) => {
      const tagName = document.activeElement.tagName.toLowerCase();

      if (tagName === "input") return;

      switch (e.key.toLowerCase()) {
        case " ":
          if (tagName === "button") return;
        case "k":
          togglePlay();
          break;
        case "f":
          toggleFullScreenMode();
          break;
        case "t":
          toggleTheaterMode();
          break;
        case "i":
          toggleMiniPlayerMode();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          skip(-5);
          break;
        case "arrowright":
        case "l":
          skip(5);
          break;
        case "c":
          toggleCaptions();
          break;
      }
    });

    // Play/Pause Button
    playPauseBtn.addEventListener("click", togglePlay);
    Video.addEventListener("click", togglePlay);

    function togglePlay() {
      Video.paused ? Video.play() : Video.pause();
    }

    Video.addEventListener("play", () => {
      videoContainer.classList.remove("paused");
    });

    Video.addEventListener("pause", () => {
      videoContainer.classList.add("paused");
    });

    // Theater Mode Button
    theaterBtn.addEventListener("click", toggleTheaterMode);

    function toggleTheaterMode() {
      videoContainer.classList.toggle("theater");
    }

    // Full Screen Button
    fullScreenBtn.addEventListener("click", toggleFullScreenMode);

    function toggleFullScreenMode() {
      if (document.fullscreenElement == null) {
        videoContainer.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    // Mini Player Button
    miniPlayerBtn.addEventListener("click", toggleMiniPlayerMode);

    function toggleMiniPlayerMode() {
      if (videoContainer.classList.contains("mini-player")) {
        document.exitPictureInPicture();
      } else {
        Video.requestPictureInPicture();
      }
    }

    // Mute Button
    muteBtn.addEventListener("click", toggleMute);

    function toggleMute() {
      Video.muted = !Video.muted;
    }

    Video.addEventListener("volumechange", () => {
      volumeSlider.value = Video.volume;
      let volumeLevel;
      if (Video.muted || Video.volume === 0) {
        volumeSlider.value = 0;
        volumeLevel = "muted";
      } else if (Video.volume >= 0.5) {
        volumeLevel = "high";
      } else {
        volumeLevel = "low";
      }

      videoContainer.dataset.volumeLevel = volumeLevel;
    });

    // Speed Button
    speedBtn.addEventListener("click", changePlaybackSpeed);

    function changePlaybackSpeed() {
      let newPlaybackRate = Video.playbackRate + 0.25;
      if (newPlaybackRate > 2) newPlaybackRate = 0.25;
      Video.playbackRate = newPlaybackRate;
      speedBtn.textContent = `${newPlaybackRate}x`;
    }

    // Current Time and Total Time
Video.addEventListener("loadeddata", () => {
  totalTimeElem.textContent = formatDuration(Video.duration);
});

Video.addEventListener("timeupdate", () => {
  currentTimeElem.textContent = formatDuration(Video.currentTime);
  const percent = Video.currentTime / Video.duration;
  timelineContainer.style.setProperty("--progress-position", percent);
});

// Volume Slider
volumeSlider.addEventListener("input", (e) => {
  Video.volume = e.target.value;
  Video.muted = e.target.value === 0;
});

// Timeline
timelineContainer.addEventListener("mousemove", handleTimelineUpdate);
timelineContainer.addEventListener("mousedown", toggleScrubbing);
document.addEventListener("mouseup", (e) => {
  if (isScrubbing) toggleScrubbing(e);
});
document.addEventListener("mousemove", (e) => {
  if (isScrubbing) handleTimelineUpdate(e);
});

let isScrubbing = false;
let wasPaused = false;

function handleTimelineUpdate(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  const previewImg = timelineContainer.querySelector(".preview-img");
  timelineContainer.style.setProperty("--preview-position", percent);

  if (previewImg) {
    const videoDuration = Video.duration;
    const previewIndex = Math.floor((percent * videoDuration) / 10); // Every 10 seconds
    if (previewImages[previewIndex]) {
      previewImg.src = previewImages[previewIndex];
    }
  }

  if (isScrubbing) {
    e.preventDefault();
    timelineContainer.style.setProperty("--progress-position", percent);
  }
}

function toggleScrubbing(e) {
  const rect = timelineContainer.getBoundingClientRect();
  const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
  isScrubbing = (e.buttons & 1) === 1;

  videoContainer.classList.toggle("scrubbing", isScrubbing);

  if (isScrubbing) {
    wasPaused = Video.paused;
    Video.pause();
  } else {
    Video.currentTime = percent * Video.duration;
    if (!wasPaused) Video.play();
  }

  handleTimelineUpdate(e);
}

    // Functions for formatting duration and skipping
    const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
      minimumIntegerDigits: 2,
    });

    function formatDuration(time) {
      const seconds = Math.floor(time % 60);
      const minutes = Math.floor(time / 60) % 60;
      const hours = Math.floor(time / 3600);
      if (hours === 0) {
        return `${minutes}:${leadingZeroFormatter.format(seconds)}`;
      } else {
        return `${hours}:${leadingZeroFormatter.format(
          minutes
        )}:${leadingZeroFormatter.format(seconds)}`;
      }
    }

    function skip(duration) {
      Video.currentTime += duration;
    }

    function toggleCaptions() {
      const captions = Video.textTracks[0];
      const isHidden = captions.mode === "hidden";
      captions.mode = isHidden ? "showing" : "hidden";
      videoContainer.classList.toggle("captions", isHidden);
    }

    function setupNavigation() {
      const nextBtn = document.getElementById("next-btn");
      const prevBtn = document.getElementById("previous-btn");

      nextBtn.addEventListener("click", () => {
        if (currentIndex < videoIds.length - 1) {
          currentIndex++;
          navigateToVideo(videoIds[currentIndex]);
        }
        updateNavigationButtons();
      });

      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
          navigateToVideo(videoIds[currentIndex]);
        }
        updateNavigationButtons();
      });

      // Initial update of button visibility
      updateNavigationButtons();
    }

    function navigateToVideo(videoId) {
      window.location.href = `/watch?videoId=${videoId}`;
    }

    function updateNavigationButtons() {
      const nextBtn = document.getElementById("next-btn");
      const prevBtn = document.getElementById("previous-btn");

      if (currentIndex >= videoIds.length - 1) {
        nextBtn.style.display = "none";
      } else {
        nextBtn.style.display = "inline-block";
      }

      if (currentIndex <= 0) {
        prevBtn.style.display = "none";
      } else {
        prevBtn.style.display = "inline-block";
      }
    }

    // Share Modal Elements
    const videoPageUrl = window.location.href;
    const shareBtn = document.getElementById("share-btn");
    const shareModal = document.getElementById("share-modal");
    const closeModal = document.querySelector(".close-modal");
    const shareLinkInput = document.getElementById("share-link");
    const copyBtn = document.getElementById("copy-btn");
    const whatsappShare = document.getElementById("whatsapp-share");
    const facebookShare = document.getElementById("facebook-share");
    const twitterShare = document.getElementById("twitter-share");
    const linkedinShare = document.getElementById("linkedin-share");
    const emailShare = document.getElementById("email-share");

    // Open Share Modal
    shareBtn.addEventListener("click", () => {
      shareLinkInput.value = videoPageUrl;
      whatsappShare.href = `https://api.whatsapp.com/send?text=${videoPageUrl}`;
      facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${videoPageUrl}`;
      twitterShare.href = `https://twitter.com/intent/tweet?url=${videoPageUrl}`;
      linkedinShare.href = `https://www.linkedin.com/shareArticle?mini=true&url=${videoPageUrl}`;
      emailShare.href = `mailto:?subject=Check%20this%20video&body=${videoPageUrl}`;
      shareModal.style.display = "block";
    });

    // Close Share Modal
    closeModal.addEventListener("click", () => {
      shareModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
      if (event.target == shareModal) {
        shareModal.style.display = "none";
      }
    });

    // Copy Link to Clipboard
    copyBtn.addEventListener("click", () => {
      shareLinkInput.select();
      document.execCommand("copy");
    });

    document.getElementById('copy-btn').addEventListener('click', function () {
      const copyText = document.getElementById('share-link');
      copyText.select();
      copyText.setSelectionRange(0, 99999); // For mobile devices
      document.execCommand('copy');

      // Change the SVG icon and button text
      const iconSpan = this.querySelector('.icon');
      iconSpan.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
    <path d="M268-240 42-466l57-56 170 170 56 56-57 56Zm226 0L268-466l56-57 170 170 368-368 56 57-424 424Zm0-226-57-56 198-198 57 56-198 198Z"/>
  </svg>
`;

      this.firstChild.textContent = 'Copied';
    });

  });
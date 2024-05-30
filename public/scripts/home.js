document.addEventListener("DOMContentLoaded", async () => {
    const videoContainer = document.getElementById("video-container");

    try {
      const response = await fetch("/navigate-videos?page=1&limit=10");
      const data = await response.json();

      data.videos.forEach((video) => {
        const videoCard = document.createElement("div");
        videoCard.classList.add(
          "card",
          "relative",
          "overflow-hidden",
          "rounded-lg",
          "shadow-lg"
        );
        videoCard.innerHTML = `
        <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-48 object-cover" />
        <div class="p-4 card-overlay absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <h3 class="text-lg font-semibold text-white mb-2">${video.title}</h3>
          <div class="flex items-center justify-between absolute bottom-5 left-5 right-5">
            <button class="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600 watch-button" data-id="${video._id}">
              Watch
            </button>
            <button class="bg-gray-900 text-white py-1 px-4 rounded hover:bg-gray-800">
              Like
            </button>
          </div>
        </div>
      `;
        videoContainer.appendChild(videoCard);
      });

      document.querySelectorAll(".watch-button").forEach((button) => {
        button.addEventListener("click", (event) => {
          const videoId = event.target.getAttribute("data-id");
          window.location.href = `/watch?videoId=${videoId}`;
        });
      });
    } catch (error) {
      console.error("Error fetching videos:", error);
    }

  });
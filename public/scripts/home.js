document.addEventListener("DOMContentLoaded", async () => {
  const videoContainer = document.getElementById("video-container");
  const infoModal = document.getElementById("infoModal");
  const modalThumbnail = document.getElementById("modal-thumbnail");
  const modalTitle = document.getElementById("modal-title");
  const modalDescription = document.getElementById("modal-description");
  const watchButton = document.getElementById("watchButton");
  const closeModal = document.getElementById("closeModal");

  closeModal.addEventListener("click", () => {
    infoModal.classList.add("hidden");
  });

  modalThumbnail.addEventListener("click", () => {
    const videoId = watchButton.getAttribute("data-id");
    window.location.href = `/watch?videoId=${videoId}`;
  });

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
              "shadow-lg",
              "cursor-pointer",
              "group"
          );
          videoCard.innerHTML = `
              <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-48 object-cover" />
              <div class="p-4 absolute top-0 left-0 right-0 bg-black bg-opacity-20 text-white">
                  <h3 class="text-lg font-semibold mb-2">${video.title}</h3>
              </div>
              <div class="absolute inset-0 bg-black bg-opacity-10 opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
                  <button class="bg-orange-700 text-white py-1 px-4 rounded hover:bg-orange-600 more-info-button" data-thumbnail="${video.thumbnail}" data-title="${video.title}" data-description="${video.description}" data-id="${video._id}">
                      More info
                  </button>
              </div>
          `;
          videoCard.addEventListener("click", () => {
              window.location.href = `/watch?videoId=${video._id}`;
          });
          videoContainer.appendChild(videoCard);
      });

      document.querySelectorAll(".more-info-button").forEach((button) => {
          button.addEventListener("click", (event) => {
              event.stopPropagation();
              const thumbnail = button.getAttribute("data-thumbnail");
              const title = button.getAttribute("data-title");
              const description = button.getAttribute("data-description");
              const videoId = button.getAttribute("data-id");

              modalThumbnail.src = thumbnail;
              modalTitle.textContent = title;
              modalDescription.textContent = description;
              watchButton.setAttribute("data-id", videoId);

              infoModal.classList.remove("hidden");
          });
      });

      watchButton.addEventListener("click", () => {
          const videoId = watchButton.getAttribute("data-id");
          window.location.href = `/watch?videoId=${videoId}`;
      });
  } catch (error) {
      console.error("Error fetching videos:", error);
  }
});
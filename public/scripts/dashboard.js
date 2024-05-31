document.addEventListener("DOMContentLoaded", () => {
    // Sidebar and content elements
    const btn = document.getElementById('mobile-menu-button');
    const sidebar = document.getElementById('sidebar');
    const links = [
        { link: document.getElementById('dashboard-link'), content: document.getElementById('dashboard-content') },
        { link: document.getElementById('analytics-link'), content: document.getElementById('analytics-content') },
        { link: document.getElementById('content-link'), content: document.getElementById('content-content') },
        { link: document.getElementById('settings-link'), content: document.getElementById('settings-content') }
    ];

    // Upload video elements
    const uploadButton = document.getElementById('upload-button');
    const uploadModal = document.getElementById('uploadModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const uploadForm = document.getElementById('uploadForm');
    const progressContainer = document.getElementById('progressContainer');
    const uploadProgress = document.getElementById('uploadProgress');
    const submitUploadButton = document.getElementById('submitUploadButton');

    // Alert modal elements
    const alertModal = document.getElementById('alertModal');
    const alertMessage = document.getElementById('alertMessage');
    const closeAlertButton = document.getElementById('closeAlertButton');

    // Initialize default active content
    activateContent(links[0].content, links[0].link);

    // Event listeners for sidebar toggle and navigation links
    btn.addEventListener('click', toggleSidebar);
    links.forEach(({ link, content }) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            activateContent(content, link);
        });
    });

    // Event listeners for upload modal
    uploadButton.addEventListener('click', () => showModal(uploadModal));
    closeModalButton.addEventListener('click', resetUploadForm);
    uploadForm.addEventListener('submit', handleVideoUpload);

    // Event listeners for alert modal
    closeAlertButton.addEventListener('click', () => hideModal(alertModal));

    // Fetch and display analytics data
    fetchAnalyticsData();

    // Fetch and display videos
    document.getElementById('content-link').addEventListener('click', (e) => {
        e.preventDefault();
        activateContent(document.getElementById('content-content'), document.getElementById('content-link'));
        fetchVideos();
    });

    // OTP and password reset forms
    handleOtpAndPasswordReset();

    function toggleSidebar() {
        sidebar.classList.toggle('-translate-x-full');
    }

    function hideAllContents() {
        links.forEach(({ content, link }) => {
            content.classList.add('hidden');
            link.classList.remove('bg-orange-700');
        });
    }

    function activateContent(content, link) {
        hideAllContents();
        content.classList.remove('hidden');
        link.classList.add('bg-orange-700');
    }

    function showModal(modal) {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
    }

    function hideModal(modal) {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    }

    function resetUploadForm() {
        hideModal(uploadModal);
        uploadForm.reset();
        progressContainer.classList.add('hidden');
        uploadProgress.value = 0;
        submitUploadButton.disabled = false;
    }

    async function handleVideoUpload(event) {
        event.preventDefault();
        submitUploadButton.disabled = true;
        progressContainer.classList.remove('hidden');
        try {
            await uploadVideo();
            showAlert('Video uploaded successfully');
        } catch (error) {
            showAlert('Failed to upload video');
        } finally {
            resetUploadForm();
        }
    }

    async function uploadVideo() {
        const formData = new FormData(uploadForm);
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    uploadProgress.value = percentComplete;
                }
            });
            xhr.open('POST', '/upload-video');
            xhr.send(formData);
            xhr.onload = () => (xhr.status === 200 || xhr.status === 201) ? resolve() : reject();
            xhr.onerror = () => reject();
        });
    }

    function showAlert(message) {
        alertMessage.textContent = message;
        showModal(alertModal);
    }

    async function fetchAnalyticsData() {
        try {
            const [overviewData, mostWatchedVideoData, performanceData, demographicsData] = await Promise.all([
                fetchData('/analytics/overview'),
                fetchData('/most-watched-video'),
                fetchData('/analytics/performance'),
                fetchData('/analytics/demographics')
            ]);

            updateOverviewData(overviewData);
            updateMostWatchedVideoData(mostWatchedVideoData);
            renderPerformanceChart(performanceData);
            renderDemographicsChart(demographicsData);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        }
    }

    async function fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
        return response.json();
    }

    function updateOverviewData(data) {
        document.querySelector("#analytics-content .views h2").textContent = data.views;
        document.querySelector("#analytics-content .watch-time h2").textContent = data.watchTime;
        document.querySelector("#analytics-content .subscribers h2").textContent = data.subscribers;
        document.querySelector("#analytics-content .total-videos h2").textContent = data.totalVideos;
        document.getElementById('current-subscribers').textContent = data.subscribers;
        document.getElementById('total-views').textContent = data.views;
        document.getElementById('total-watch-time').textContent = data.watchTime;
    }

    function updateMostWatchedVideoData(data) {
        const videoThumbnail = document.getElementById('most-watched-video-thumbnail');
        const videoDescription = document.getElementById('most-watched-video-description');
        const videoTitle = document.getElementById('most-watched-video-title');
        videoThumbnail.src = data.thumbnail;
        videoThumbnail.alt = data.title;
        videoDescription.textContent = data.description;
        videoTitle.textContent = data.title;
    }

    function renderPerformanceChart(data) {
        const ctxPerformance = document.getElementById('performanceChart').getContext('2d');
        new Chart(ctxPerformance, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Views',
                    data: data.datasets.views,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }, {
                    label: 'Watch Time (hours)',
                    data: data.datasets.watchTime,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function renderDemographicsChart(data) {
        const ctxDemographics = document.getElementById('demographicsChart').getContext('2d');
        new Chart(ctxDemographics, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Analytics',
                    data: data.datasets,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    async function fetchVideos() {
        try {
            const data = await fetchData("/navigate-videos?page=1&limit=10");
            renderVideos(data.videos);
        } catch (error) {
            console.error("Error fetching videos:", error);
        }
    }

    function renderVideos(videos) {
        const videoContainer = document.getElementById("video-container");
        videoContainer.innerHTML = '';  // Clear previous videos

        videos.forEach((video) => {
            const videoCard = document.createElement("div");
            videoCard.classList.add("card", "relative", "overflow-hidden", "rounded-lg", "shadow-lg", "bg-[#111111]", "text-white");
            videoCard.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-48 object-cover" />
                <div class="p-4 card-overlay absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <h3 class="text-lg font-semibold text-white mb-2">${video.title}</h3>
                    <div class="flex items-center justify-between absolute bottom-5 left-5 right-5">
                        <button class="bg-orange-500 text-white py-1 px-4 rounded hover:bg-orange-600 watch-button" data-id="${video._id}">
                            Watch
                        </button>
                        <button class="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600 delete-button" data-id="${video._id}">
                            Delete
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

        document.querySelectorAll(".delete-button").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const videoId = event.target.getAttribute("data-id");
                await handleVideoDeletion(videoId);
            });
        });
    }

    async function handleVideoDeletion(videoId) {
        try {
            const response = await fetch(`/delete-video/${videoId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete the video');
            showAlert('Video deleted successfully');
            fetchVideos();
        } catch (error) {
            showAlert('Error deleting video');
            console.error('Error deleting video:', error);
        }
    }

    function handleOtpAndPasswordReset() {
        const otpRequestForm = document.getElementById('otp-request-form');
        const passwordResetForm = document.getElementById('password-reset-form');

        otpRequestForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = event.target.email.value;
            try {
                const data = await requestOtp(email);
                if (data.message === 'Password reset OTP sent to your email') {
                    otpRequestForm.classList.add('hidden');
                    passwordResetForm.classList.remove('hidden');
                } else {
                    showAlert(data.message || 'Failed to send OTP');
                }
            } catch (error) {
                showAlert('Error requesting OTP');
            }
        });

        passwordResetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = otpRequestForm.email.value;
            const otp = event.target.otp.value;
            const newPassword = event.target['new-password'].value;
            try {
                const data = await resetPassword(email, otp, newPassword);
                if (data.message === 'Password reset successfully') {
                    showAlert('Password reset successfully');
                    otpRequestForm.reset();
                    passwordResetForm.reset();
                    otpRequestForm.classList.remove('hidden');
                    passwordResetForm.classList.add('hidden');
                } else {
                    showAlert(data.message || 'Failed to reset password');
                }
            } catch (error) {
                showAlert('Error resetting password');
            }
        });
    }

    async function requestOtp(email) {
        const response = await fetch('/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        if (!response.ok) throw new Error('Failed to request OTP');
        return response.json();
    }

    async function resetPassword(email, otp, newPassword) {
        const response = await fetch('/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword })
        });
        if (!response.ok) throw new Error('Failed to reset password');
        return response.json();
    }
});
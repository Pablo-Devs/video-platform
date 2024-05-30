const btn = document.getElementById('mobile-menu-button');
        const sidebar = document.getElementById('sidebar');

        const dashboardLink = document.getElementById('dashboard-link');
        const analyticsLink = document.getElementById('analytics-link');
        const contentLink = document.getElementById('content-link');
        const settingsLink = document.getElementById('settings-link');

        const dashboardContent = document.getElementById('dashboard-content');
        const analyticsContent = document.getElementById('analytics-content');
        const contentContent = document.getElementById('content-content');
        const settingsContent = document.getElementById('settings-content');

        const contents = [dashboardContent, analyticsContent, contentContent, settingsContent];
        const links = [dashboardLink, analyticsLink, contentLink, settingsLink];

        btn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });

        dashboardLink.addEventListener('click', (e) => {
            e.preventDefault();
            activateContent(dashboardContent, dashboardLink);
        });

        analyticsLink.addEventListener('click', (e) => {
            e.preventDefault();
            activateContent(analyticsContent, analyticsLink);
        });

        contentLink.addEventListener('click', (e) => {
            e.preventDefault();
            activateContent(contentContent, contentLink);
        });

        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            activateContent(settingsContent, settingsLink);
        });

        function hideAllContents() {
            contents.forEach(content => {
                content.classList.add('hidden');
            });
            links.forEach(link => {
                link.classList.remove('bg-orange-700');
            });
        }

        function activateContent(content, link) {
            hideAllContents();
            content.classList.remove('hidden');
            link.classList.add('bg-orange-700');
        }

        document.getElementById('navigate-videos-link').addEventListener('click', (e) => {
            e.preventDefault();
            activateContent(contentContent, contentLink);
            fetchVideos();
        });

        // Default active link and content
        dashboardContent.classList.remove('hidden');
        dashboardLink.classList.add('bg-orange-700');

        // Upload Video
        const uploadButton = document.getElementById('upload-button');
        const uploadModal = document.getElementById('uploadModal');
        const closeModalButton = document.getElementById('closeModalButton');
        const uploadForm = document.getElementById('uploadForm');
        const progressContainer = document.getElementById('progressContainer');
        const uploadProgress = document.getElementById('uploadProgress');
        const submitUploadButton = document.getElementById('submitUploadButton');

        uploadButton.addEventListener('click', () => {
            uploadModal.classList.remove('hidden');
        });

        closeModalButton.addEventListener('click', () => {
            resetUploadForm();
        });

        function resetUploadForm() {
            uploadModal.classList.add('hidden');
            uploadForm.reset();
            progressContainer.classList.add('hidden');
            uploadProgress.value = 0;
            submitUploadButton.disabled = false;
        }

        // Get modal elements
        const alertModal = document.getElementById('alertModal');
        const alertMessage = document.getElementById('alertMessage');
        const closeAlertButton = document.getElementById('closeAlertButton');

        // Function to show alert modal
        function showAlert(message) {
            alertMessage.textContent = message;
            alertModal.classList.remove('hidden');
        }

        // Function to hide alert modal
        closeAlertButton.addEventListener('click', () => {
            alertModal.classList.add('hidden');
        });

        // Upload Video Function
        async function uploadVideo() {
            const formData = new FormData(uploadForm);
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    uploadProgress.value = percentComplete;
                }
            });

            xhr.open('POST', '/upload-video');
            xhr.send(formData);

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    showAlert('Video uploaded successfully');
                } else {
                    showAlert('Failed to upload video');
                }
                resetUploadForm();
            };

            xhr.onerror = () => {
                showAlert('Error uploading video');
                resetUploadForm();
            };
        }

        // Add event listener for form submission
        uploadForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submitUploadButton.disabled = true;
            progressContainer.classList.remove('hidden');
            uploadVideo();
        });

        document.addEventListener("DOMContentLoaded", async () => {
            try {
                // Fetch overview data
                const overviewResponse = await fetch('/analytics/overview');
                const overviewData = await overviewResponse.json();
    
                document.querySelector("#analytics-content .views h2").textContent = overviewData.views;
                document.querySelector("#analytics-content .watch-time h2").textContent = overviewData.watchTime;
                document.querySelector("#analytics-content .subscribers h2").textContent = overviewData.subscribers;
                document.querySelector("#analytics-content .total-videos h2").textContent = overviewData.totalVideos;
    
                // Fetch performance data
                const performanceResponse = await fetch('/analytics/performance');
                const performanceData = await performanceResponse.json();
    
                const ctxPerformance = document.getElementById('performanceChart').getContext('2d');
                new Chart(ctxPerformance, {
                    type: 'line',
                    data: {
                        labels: performanceData.labels,
                        datasets: [{
                            label: 'Views',
                            data: performanceData.datasets.views,
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }, {
                            label: 'Watch Time (hours)',
                            data: performanceData.datasets.watchTime,
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
    
                // Fetch demographics data
                const demographicsResponse = await fetch('/analytics/demographics');
                const demographicsData = await demographicsResponse.json();
    
                const ctxDemographics = document.getElementById('demographicsChart').getContext('2d');
                new Chart(ctxDemographics, {
                    type: 'doughnut',
                    data: {
                        labels: demographicsData.labels,
                        datasets: [{
                            label: 'Analytics',
                            data: demographicsData.datasets,
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
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            }
        });
            async function fetchVideos() {
                try {
                    const response = await fetch("/navigate-videos?page=1&limit=10");
                    const data = await response.json();
    
                    const videoContainer = document.getElementById("video-container");
                    videoContainer.innerHTML = '';  // Clear previous videos
    
                    data.videos.forEach((video) => {
                        const videoCard = document.createElement("div");
                        videoCard.classList.add(
                            "card",
                            "relative",
                            "overflow-hidden",
                            "rounded-lg",
                            "shadow-lg",
                            "bg-[#111111]",
                            "text-white"
                        );
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
                            const deleteButton = event.target;
    
                            deleteButton.disabled = true;
                            showProgressModal();
    
                            await deleteVideo(videoId);
    
                            deleteButton.disabled = false;
                            hideProgressModal();
                            fetchVideos();  // Refresh the video list
                        });
                    });
                } catch (error) {
                    console.error("Error fetching videos:", error);
                }
            }
    
            async function deleteVideo(videoId) {
                try {
                    const response = await fetch(`/delete-video/${videoId}`, {
                        method: 'DELETE',
                    });
    
                    if (!response.ok) {
                        throw new Error('Failed to delete the video');
                    }
    
                    showAlert('Video deleted successfully');
                } catch (error) {
                    showAlert('Error deleting video');
                    console.error('Error deleting video:', error);
                }
            }
    
            function showProgressModal() {
                document.getElementById('progress-modal').classList.remove('hidden');
            }
    
            function hideProgressModal() {
                document.getElementById('progress-modal').classList.add('hidden');
            }
    
            // Fetch videos when the content section is shown
            document.getElementById('content-link').addEventListener('click', fetchVideos);
    
            document.addEventListener('DOMContentLoaded', function () {
                const otpRequestForm = document.getElementById('otp-request-form');
                const passwordResetForm = document.getElementById('password-reset-form');
    
                otpRequestForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const email = event.target.email.value;
                    try {
                        const response = await fetch('/forgot-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email })
                        });
                        const data = await response.json();
                        if (response.ok && data.message === 'Password reset OTP sent to your email') {
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
                        const response = await fetch('/reset-password', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ email, otp, newPassword })
                        });
                        const data = await response.json();
                        if (response.ok) {
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
    
            });
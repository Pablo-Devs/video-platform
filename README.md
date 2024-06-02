# Video Platform

This project aims to develop a bespoke video platform for content creator Paul Leonard, addressing branding issues he encountered with other hosting platforms. The platform allows video uploads exclusively for his brand, providing users with features such as video navigation, sharing, and account management.

## Features

### User Capabilities
- **Sign Up & Log In**: Users can sign up and log in using their email and password, with account verification and password reset features.
- **Video Navigation**: Users can navigate through video pages.
- **Video Sharing**: Users can share links to videos on different pages.

### Admin Capabilities
- **Video Uploads**: Admins can upload videos with titles and descriptions.

### Video Page
- **Single Video Display**: Each page displays only one video.
- **Navigation Buttons**: Contains next and previous buttons to navigate between videos. These buttons hide if no further videos are available.
- **Control Buttons**: Common video control buttons for user interaction.
- **Sharing**: Share button for users to share the video link.
- **Deployed Link**: Find the deployed link below
    ```sh
    https://paul-leonard-video-platform.onrender.com
    ```

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Pablo-Devs/video-platform.git
    ```

2. Navigate to the project directory:
    ```sh
    cd video-platform
    ```

3. Install the dependencies:
    ```sh
    npm install
    ```

## Usage 

1. Start the application:
    ```sh
    npm start
    ```

2. Open your browser and go to `http://localhost:3000`
    - You can change the port based on your preference.

## Project Structure

```plaintext
video-platform/
├── controllers/
│   ├── authControllers/
│   │   ├── accountController.js
│   │   ├── loginController.js
│   │   ├── logoutController.js
│   │   └── signupController.js
│   ├── videoControllers/
│   │   ├── fetchVideosController.js
│   │   ├── uploadVideosController.js
│   │   └── videosAnalytics.js
├── middlewares/
│   ├── authMiddlewares.js
│   ├── generateImages.js
│   └── watchTimeMiddleware.js
├── models/
│   ├── analytics.js
│   ├── User.js
│   └── Video.js
├── routes/
│   ├── authRoutes.js
│   ├── fetchVideosRoutes.js
│   ├── videoAnalyticsRoutes.js
│   └── videoUploadRoutes.js
├── public/                # Static files like CSS, JavaScript, and images
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── scripts.js
│   └── images/
├── views/                 # EJS templates for rendering the front-end
│   ├── auth/
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   └── resetPassword.ejs
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── admin/
│   │   ├── dashboard.ejs
│   │   └── uploadVideo.ejs
│   ├── video/
│   │   ├── videoPage.ejs
│   │   └── videoList.ejs
│   └── index.ejs
├── .gitignore             # Files and directories to be ignored by Git
├── package.json           # Project metadata and dependencies
├── README.md              # Project documentation
└── server.js              # Main entry point of the application
```

## Contributing

1. Fork the repository.

2. Create a new branch (git checkout -b feature-branch).

3. Commit your changes (git commit -am 'Add new feature').

4. Push to the branch (git push origin feature-branch).

5. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For any inquiries or feedback, please contact Paul Blankson (AKA: Pablo-Devs).
     ```sh
     https://github.com/Pablo-Devs/
     ```
     ```sh
     https://www.instagram.com/pablo_devs/
     ```




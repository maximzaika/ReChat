# ReChat

Chat application that is currently supported by large screen devices. Once
core features are enabled, the UI will be improved and will also be 
converted to mobile first. Allows users to create accounts and send messages
to their friends in the friend list (adding friends isn't added yet). 
Messages are encrypted and verified by the server. Connection must always 
go through the ExpressJS (client - server - client). It is a stateful API.

# Video Demonstration 

- Build: Alpha 0.91:
  - Comes with few bugs that will be fixed within a week depending
    on my time availability.
   [YouTube Video Demonstration](https://youtu.be/yg3dsdgJAU4)
   **Note: All the bugs that can be seen in the video of 0.91 are fixed. Video is to be updated.**

# Tech

- Client:
  - ReactJS, TailwindCSS, SocketIO, HTML, CSS3, Firebase, Supports HTTP Requests

- Server:
  - ExpressJS, SocketIO, PHP, Supports HTTP requests

# Plan

- Fix remaining bugs in the bug section
- Rename current friend list to a chat list
- Create an independent friend list and allow users to add and search friends
- Move Authentication logic to ExpressJS (currently it is a mix of Firebase & PHP)
- Allow users to customise their privacy, like:
  - Disable Last Seen feature
- Messages that cannot be deleted for both users at the same time (expired time), allow
  clients to delete them locally only.

# Features

- Authentication system:
  * Combination of Firebase and SQL (firebase stores username and password, 
    while SQL stores other data - planned to be changed in the future to use
    NodeJS/ExpressJS + JWT). Currently, SQL is accessed via PHP.
  * Allows users to register new accounts:
    1. Validates existing accounts.
    2. Validates passwords to ensure their strength.
    3. All other features that Firebase provides.
  * Allows users to login and retrieve their friend list & messages.
  * Allows users to logout manually on the main page.
  * Based on Firebase's token stored in cache automatically logs user in
    (if token isn't expired - for now it never gets expired for some reason
     - the plan is to fix it after changing the architecture to ExpressJS + JWT).
- Connects to all the friends (chat rooms) in the list on load.
  * Using Socket.IO for real-time processing.
- Sends message by the press of Enter on the keyboard or button.
- Messages that contain new line get broken down correctly.
- Resizes the input of the new message if it gets too long:
  * Up to 5 lines, and then it goes into overflow.
- Sender's and recipient's messages are displayed correctly on each side:
  * Sender (my message) is on the right, friend's message is on the left side.
- Shows user's online status when their chat is opened.
  * Shows last seen status if user has closed the chat.
- Shows number of unread messages in the friend list.
- Sorts friend list based on the last received message (timestamp):
  * Friend with the most recent messages is always on top.
- Updates friend's list with the most recent message
- Shows the date of the received message in the following format:
  * Received yesterday? - shows Yesterday
  * Received within the previous week? - shows the day of the week: Sunday, Monday
  * Received more than a week ago? - shows the exact date: 15/12/2020
- Shows sent, received, seen message statuses that are verified by the server.
- Allows users to delete the most recent messages. The message is recent if it
  is within 1 hour time frame.

# Known bugs

- ~~Server: Current online status is not getting saved. If both users
  are online, it is getting updated correctly. However, if users 
  connect to the chat at different times and one of the users is online
  another user is not get notified. A.k.a doesn't work on page refresh.~~
- ~~Server: Last online is not getting updated. If both users
  are online, it is getting updated correctly. However, if users
  connect to the chat at different times and one of the users is online
  another user is not get notified. A.k.a doesn't work on page refresh.~~
- ~~Server: Refreshing the page and opening the chat is not showing
    online status if it was open before~~
- Client: Auto authentication doesn't validate token's expiry time.
- Client: Message input size doesn't get reset after it is sent.
- Client: Showing seen before sent / received (but sent/received is 
  shown correctly at the end)
- Server or Client : Valeriy account sending to Test updates Maxim instead. 
  It doesn't take the correct id or index onto the account.
- ~~Client (friend list): If chat is opened, message counter should always be 
  0 or reset itself if message in view (right now it doesn't reset in this case)~~
- Client: Delete message button (1hr time timer) refresh on load or rerender. 
  It needs to disable the deletion if it goes past 1 hr automatically.
- ~~Client: Receiving a message from the user that has no messages crashing the 
  application.~~
- ~~Server : If 2 parties have chat opened, the message doesn't get saved on the 
  server side. Which causes issues like deleting non-existent message or not
  receiving the message on page refresh.~~
- ~~Client: New message is incorrectly updated in the friend list upon sending a 
  new message. Expected behaviour: friend's recent message is updated and friend
  list is sorted by the most recent message. Current behaviour: incorrect friend
  is updated (always the top friend) and no sorting is done.~~
- Client: If message is deleted, friend list is not showing that it is deleted but
  instead showing the full message.

# How to Run

- Client side:
  * Create file `./src/services/apis.js`
    * Add Firebase API key with the following exported constant:
      `export const firebaseAuthenticationAPIKey = "FIREBASE_API_KEY";`

  * In the client directory run the following commands:
    1. `npm install`
    2. `npm start`

- Server side:
  * Ensure that SQL database is running
  * In the server directory run the following commands:
    1. `npm install`
    2. `node .\server.js` or `nodemon .\server.js`

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can???t go back!**

If you aren???t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you???re on your own.

You don???t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn???t feel obligated to use this feature. However we understand that this tool wouldn???t be useful if you couldn???t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

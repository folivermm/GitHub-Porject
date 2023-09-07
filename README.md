# Grub Dash Website Backend

## Introduction

This repository sets up an API and builds out specific routes so that frontend developers can demo some initial design ideas.

## Features and Achievements

- Used common middleware packages
- Handled requests through routes
- Accessed relevant information through route parameters
- Built an API following RESTful design principles
- Implemented custom middleware functions

## Routes

- **GET /dishes:** Responds with a list of all existing dish data.

- **POST /dishes:** Saves a new dish and responds with the newly created dish.

- **GET /dishes/:dishId:** Responds with the dish where id === :dishId or returns 404 if no matching dish is found.

- **PUT /dishes/:dishId:** Updates the dish where id === :dishId or returns 404 if no matching dish is found.

- **GET /orders:** Responds with a list of all existing order data.

- **POST /orders:** Saves a new order and responds with the newly created order.

- **GET /orders/:orderId:** Responds with the order where id === :orderId or returns 404 if no matching order is found.

- **PUT /orders/:orderId:** Updates the order where id === :orderId or returns 404 if no matching order is found.

- **DELETE /orders/:orderId:** Deletes the order where id === :orderId.

- **Validation middleware:**
	Created validation middleware to check ID’s existence before allowing GET, PUT, POST, and DELETE requests. 


## Getting Started

Follow these instructions to set up both the backend and frontend components of the Grub Dash Website. This ensures you experience the full functionality of the website.

### Frontend Repository

Check out the frontend repository and its README at: [starter-grub-dash-front-end](https://github.com/folivermm/starter-grub-dash-front-end).

1. **Install dependencies and start:**
   - `npm install`
   - `npm start`

2. **Troubleshooting Frontend:**
   If you encounter any issues while setting up the frontend, try the following step:
   - `npm audit fix --force`

3. **Set Up Environment:**
   Create a `.env.development` file and add the following:
   - `API_BASE_URL="http://localhost:5000"`

4. **Run the build process:**
   - `npm run build`

### Backend Setup

1. **Fork and Clone:**
   Begin by forking and cloning this repository to your local machine.

2. **Install Dependencies:**
   Run the following command to install required dependencies:
   - `npm install`

3. **Set Up Environment:**
   Create a `.env` file and add the following:
   - `NODE_ENV="http://localhost:5000"`

### Frontend and Backend Integration

1. **Frontend Workspace:**
   Open the frontend repository and add the backend repository as a workspace.

2. **Terminal Windows:**
   Open two terminal windows and navigate to the frontend and backend folders respectively.

3. **Backend Terminal:**
   In the backend terminal window, run:
   - `npm start`

4. **Frontend Terminal:**
   In the frontend terminal window, run:
   - `npx serve -s build --listen 3000`

5. **Visit the Site:**
   Open your web browser and visit the website at:
   - [http://localhost:3000/](http://localhost:3000/)



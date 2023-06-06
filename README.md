# Deriv Test Application

[View on StackBlitz ⚡️](https://stackblitz.com/edit/deriv-test-rabeeh)

This is a test application developed for Deriv using React. Following are the requirements

* As a user, I can filter the asset list by category (e.g Forex, Stock indices etc) and sub-category (e.g. Major pairs), so that I can find assets that match what I’m looking for.

* As a user, I can see real-time prices for each asset, so that I can decide which one I want to trade on.

* As a user, I can see the highest and lowest price in the last 24 hour period, so that I can see the fluctuations over the day.

## Technologies

* ReactJS
* Redux
* Vite
* Tailwind CSS
* NodeJS v16.15.0

## Getting Started

* Download the zip file to your local computer and unzip

* Open extracted folder in VS Code or any editor of your choice

* Run the following commands

```json

npm i

```

```json

npm run dev

```


## Improvements and further developments

* The design and UI experiences could be further developed. For eg: color of the 24h change based on increase or decrease.
* To improve performance, implementing an unsubscribe feature would allow receiving only the relevant data through the WebSocket when switching to a different section.
* Utilize Redux Thunk for handling asynchronous operations.
* Seperate actions and reducers to different folders for better code arrangement.
* If the table is getting used in other places in future, it should be made as a seperate component so that i could be reused.
* Enhance the handling of WebSocket connections. If the page is not used for a long time, the WebSocket should be closed and automatically reconnected upon any user interaction.
* Implement unit testing to ensure the reliability and correctness of the codebase.
* Write more comments on functions and other necessary sections to enhance code readability and maintainability.